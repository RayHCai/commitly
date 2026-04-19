#!/usr/bin/env python3
"""
GUI application to view and explore Weaviate database contents.

This application provides a graphical interface to:
- View all tenants in the database
- Browse document chunks by tenant
- View chunk properties and content
- See database statistics

Usage:
    python scripts/weaviate_gui.py
"""

import json
import logging
import sys
import tkinter as tk
from datetime import datetime
from pathlib import Path
from tkinter import filedialog, messagebox, scrolledtext, ttk, simpledialog

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

import weaviate  # noqa: E402

from app.config import settings  # noqa: E402
from weaviate.classes.tenants import Tenant, TenantActivityStatus  # noqa: E402

logger = logging.getLogger(__name__)

COLLECTION_NAME = "Commit"


class ChunkEditDialog:
    """Dialog for editing chunk properties."""

    def __init__(self, parent: tk.Tk, chunk: any, properties: dict) -> None:
        """Initialize the edit dialog.

        Args:
            parent: Parent window
            chunk: The chunk object being edited
            properties: Current chunk properties
        """
        self.result = None
        self.dialog = tk.Toplevel(parent)
        self.dialog.title('Edit Chunk Properties')
        self.dialog.geometry('600x700')
        self.dialog.transient(parent)
        self.dialog.grab_set()

        # Make dialog modal
        self.dialog.focus_set()

        # Create scrollable frame
        canvas = tk.Canvas(self.dialog)
        scrollbar = ttk.Scrollbar(self.dialog, orient='vertical', command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)

        scrollable_frame.bind(
            '<Configure>', lambda e: canvas.configure(scrollregion=canvas.bbox('all'))
        )

        canvas.create_window((0, 0), window=scrollable_frame, anchor='nw')
        canvas.configure(yscrollcommand=scrollbar.set)

        # Create form fields
        self.fields = {}
        row = 0

        # UUID (read-only)
        ttk.Label(scrollable_frame, text='UUID (read-only):', font=('Arial', 9, 'bold')).grid(
            row=row, column=0, sticky=tk.W, padx=10, pady=(10, 2)
        )
        row += 1
        uuid_text = tk.Text(scrollable_frame, height=2, width=50, wrap=tk.WORD)
        uuid_text.insert('1.0', str(chunk.uuid))
        uuid_text.config(state='disabled', bg='#f0f0f0')
        uuid_text.grid(row=row, column=0, columnspan=2, sticky=(tk.W, tk.E), padx=10, pady=(0, 10))
        row += 1

        # Editable fields
        editable_fields = [
            ('commit_sha', 'Commit SHA:', 'text'),
            ('repo_name', 'Repo Name:', 'text'),
            ('author', 'Author:', 'text'),
            ('chunk_index', 'Chunk Index:', 'int'),
            ('quality_score', 'Quality Score:', 'float'),
            ('complexity_score', 'Complexity Score:', 'float'),
            ('summary_score', 'Summary Score:', 'float'),
            ('message', 'Message:', 'multiline'),
            ('chunk_text', 'Chunk Text:', 'multiline'),
            ('diff', 'Diff:', 'multiline'),
        ]

        for field_name, label_text, field_type in editable_fields:
            ttk.Label(scrollable_frame, text=label_text, font=('Arial', 9, 'bold')).grid(
                row=row, column=0, sticky=tk.W, padx=10, pady=(5, 2)
            )
            row += 1

            if field_type == 'multiline':
                # Create text area for content
                text_widget = scrolledtext.ScrolledText(
                    scrollable_frame, height=10, width=50, wrap=tk.WORD
                )
                text_widget.insert('1.0', str(properties.get(field_name, '')))
                text_widget.grid(
                    row=row, column=0, columnspan=2, sticky=(tk.W, tk.E), padx=10, pady=(0, 5)
                )
                self.fields[field_name] = ('multiline', text_widget)
            else:
                # Create entry field
                entry = ttk.Entry(scrollable_frame, width=50)
                current_value = properties.get(field_name, '')
                entry.insert(0, str(current_value))
                entry.grid(row=row, column=0, columnspan=2, sticky=(tk.W, tk.E), padx=10, pady=(0, 5))
                self.fields[field_name] = (field_type, entry)

            row += 1

        # Pack canvas and scrollbar
        canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        # Buttons frame
        button_frame = ttk.Frame(self.dialog)
        button_frame.pack(side=tk.BOTTOM, fill=tk.X, pady=10)

        ttk.Button(button_frame, text='Save', command=self.save).pack(
            side=tk.RIGHT, padx=(5, 10)
        )
        ttk.Button(button_frame, text='Cancel', command=self.cancel).pack(
            side=tk.RIGHT, padx=5
        )

    def save(self) -> None:
        """Save the edited properties."""
        try:
            updated_props = {}

            for field_name, (field_type, widget) in self.fields.items():
                if field_type == 'multiline':
                    value = widget.get('1.0', tk.END).strip()
                else:
                    value = widget.get().strip()

                # Type conversion
                if field_type == 'int':
                    updated_props[field_name] = int(value) if value else 0
                elif field_type == 'float':
                    updated_props[field_name] = float(value) if value else 0.0
                else:
                    updated_props[field_name] = value

            self.result = updated_props
            self.dialog.destroy()

        except ValueError as e:
            messagebox.showerror('Validation Error', f'Invalid input: {e}')

    def cancel(self) -> None:
        """Cancel the edit operation."""
        self.dialog.destroy()


class WeaviateGUI:
    """GUI application for viewing Weaviate database contents."""

    def __init__(self, root: tk.Tk) -> None:
        """Initialize the GUI application.

        Args:
            root: The root tkinter window
        """
        self.root = root
        self.root.title('Weaviate Database Viewer')
        self.root.geometry('1200x800')

        self.client = None
        self.current_tenant = None
        self.collections = [COLLECTION_NAME]
        self.current_collection = self.collections[0]

        # Configure styles
        style = ttk.Style()
        style.theme_use('clam')

        # Create GUI components
        self.create_widgets()

        # Connect to Weaviate on startup
        self.connect_to_weaviate()

    def create_widgets(self) -> None:
        """Create all GUI widgets."""
        # Main container with padding
        main_frame = ttk.Frame(self.root, padding='10')
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(3, weight=1)

        # Title
        title_label = ttk.Label(
            main_frame,
            text='Weaviate Database Viewer',
            font=('Arial', 16, 'bold'),
        )
        title_label.grid(row=0, column=0, columnspan=3, pady=(0, 10))

        # Connection status and collection selector row
        top_bar = ttk.Frame(main_frame)
        top_bar.grid(row=1, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(0, 10))

        self.status_label = ttk.Label(
            top_bar,
            text=f'Connecting to {settings.WEAVIATE_CLOUD_URL}...',
            foreground='orange',
        )
        self.status_label.pack(side=tk.LEFT)

        # Collection selector
        self.collection_var = tk.StringVar(value=self.current_collection)
        collection_combo = ttk.Combobox(
            top_bar,
            textvariable=self.collection_var,
            values=self.collections,
            state='readonly',
            width=25,
        )
        collection_combo.pack(side=tk.RIGHT)
        collection_combo.bind('<<ComboboxSelected>>', self._on_collection_change)

        ttk.Label(top_bar, text='Collection:').pack(side=tk.RIGHT, padx=(0, 5))

        # Left panel - Tenants
        left_frame = ttk.LabelFrame(main_frame, text='Tenants', padding='5')
        left_frame.grid(row=2, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 5))

        # Tenant listbox
        self.tenant_listbox = tk.Listbox(left_frame, width=30)
        self.tenant_listbox.pack(fill=tk.BOTH, expand=True)
        self.tenant_listbox.bind('<<ListboxSelect>>', self.on_tenant_select)

        # Tenant action buttons frame
        tenant_btn_frame = ttk.Frame(left_frame)
        tenant_btn_frame.pack(fill=tk.X, pady=(5, 0))

        # Refresh button
        refresh_btn = ttk.Button(
            tenant_btn_frame, text='Refresh', command=self.load_tenants
        )
        refresh_btn.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 2))

        # Delete tenant button
        delete_tenant_btn = ttk.Button(
            tenant_btn_frame, text='Delete', command=self.delete_tenant
        )
        delete_tenant_btn.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(2, 0))

        # Middle panel - Chunks
        middle_frame = ttk.LabelFrame(main_frame, text='Chunks', padding='5')
        middle_frame.grid(
            row=2, column=1, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 5)
        )
        middle_frame.columnconfigure(0, weight=1)
        middle_frame.rowconfigure(0, weight=1)

        # Chunks treeview with scrollbar
        tree_scroll = ttk.Scrollbar(middle_frame)
        tree_scroll.pack(side=tk.RIGHT, fill=tk.Y)

        self.chunks_tree = ttk.Treeview(
            middle_frame,
            columns=('SHA', 'Repo', 'Chunk', 'Quality'),
            show='tree headings',
            yscrollcommand=tree_scroll.set,
        )
        tree_scroll.config(command=self.chunks_tree.yview)

        # Configure columns
        self.chunks_tree.heading('#0', text='Message')
        self.chunks_tree.heading('SHA', text='SHA')
        self.chunks_tree.heading('Repo', text='Repo')
        self.chunks_tree.heading('Chunk', text='Chunk')
        self.chunks_tree.heading('Quality', text='Quality')

        self.chunks_tree.column('#0', width=200)
        self.chunks_tree.column('SHA', width=100)
        self.chunks_tree.column('Repo', width=150)
        self.chunks_tree.column('Chunk', width=50)
        self.chunks_tree.column('Quality', width=60)

        self.chunks_tree.pack(fill=tk.BOTH, expand=True)
        self.chunks_tree.bind('<<TreeviewSelect>>', self.on_chunk_select)
        self.chunks_tree.bind('<Button-3>', self.show_context_menu)  # Right-click

        # Chunk action buttons frame
        chunk_btn_frame = ttk.Frame(middle_frame)
        chunk_btn_frame.pack(fill=tk.X, pady=(5, 0))

        # Load chunks button
        load_chunks_btn = ttk.Button(
            chunk_btn_frame, text='Load', command=self.load_chunks
        )
        load_chunks_btn.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 2))

        # Delete item button
        delete_item_btn = ttk.Button(
            chunk_btn_frame, text='Delete', command=self.delete_selected_item
        )
        delete_item_btn.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(2, 2))

        # Edit chunk button
        edit_chunk_btn = ttk.Button(
            chunk_btn_frame, text='Edit', command=self.edit_selected_chunk
        )
        edit_chunk_btn.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(2, 2))

        # Download commit button
        download_btn = ttk.Button(
            chunk_btn_frame, text='Download', command=self.download_document
        )
        download_btn.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(2, 0))

        # Create context menu
        self.context_menu = tk.Menu(self.root, tearoff=0)
        self.context_menu.add_command(label='Delete', command=self.delete_selected_item)
        self.context_menu.add_command(label='Edit', command=self.edit_selected_chunk)
        self.context_menu.add_separator()
        self.context_menu.add_command(label='Download Commit', command=self.download_document)
        self.context_menu.add_command(label='Delete Commit', command=self.delete_document)

        # Right panel - Details
        right_frame = ttk.LabelFrame(main_frame, text='Chunk Details', padding='5')
        right_frame.grid(row=2, column=2, sticky=(tk.W, tk.E, tk.N, tk.S))

        # Details text area
        self.details_text = scrolledtext.ScrolledText(
            right_frame, width=40, wrap=tk.WORD
        )
        self.details_text.pack(fill=tk.BOTH, expand=True)

        # Bottom panel - Statistics
        stats_frame = ttk.LabelFrame(main_frame, text='Statistics', padding='5')
        stats_frame.grid(
            row=3, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(5, 0)
        )

        self.stats_text = scrolledtext.ScrolledText(stats_frame, height=8, wrap=tk.WORD)
        self.stats_text.pack(fill=tk.BOTH, expand=True)

        # Configure grid weights for expansion
        main_frame.rowconfigure(2, weight=1)

    def connect_to_weaviate(self) -> None:
        """Connect to the Weaviate database."""
        try:
            self.client = weaviate.connect_to_weaviate_cloud(
                cluster_url=settings.WEAVIATE_CLOUD_URL,
                auth_credentials=weaviate.auth.AuthApiKey(settings.WEAVIATE_API_KEY),
            )

            self.status_label.config(
                text=f'Connected to {settings.WEAVIATE_CLOUD_URL}', foreground='green'
            )

            # Load tenants
            self.load_tenants()

        except Exception as e:
            self.status_label.config(text=f'Connection failed: {e}', foreground='red')
            logger.exception('weaviate_connection_failed', exc_info=e)
            messagebox.showerror('Connection Error', f'Failed to connect to Weaviate:\n{e}')

    def _on_collection_change(self, event: tk.Event) -> None:
        """Handle collection dropdown change."""
        self.current_collection = self.collection_var.get()
        self.current_tenant = None
        self.chunks_tree.delete(*self.chunks_tree.get_children())
        self.details_text.delete(1.0, tk.END)
        self.load_tenants()

    def load_tenants(self) -> None:
        """Load and display all tenants."""
        if not self.client:
            return

        try:
            collection = self.client.collections.get(self.current_collection)
            tenants = collection.tenants.get()

            # Clear listbox
            self.tenant_listbox.delete(0, tk.END)

            # Populate listbox
            tenant_list = list(tenants) if tenants else []
            for tenant in sorted(tenant_list):
                self.tenant_listbox.insert(tk.END, tenant)

            # Update stats
            self.stats_text.delete(1.0, tk.END)
            self.stats_text.insert(
                tk.END,
                f'Total Tenants: {len(tenant_list)}\n'
                f'Collection: {self.current_collection}\n\n'
                f'Select a tenant to view chunks.',
            )

            logger.info('tenants_loaded count=%d', len(tenant_list))

        except Exception as e:
            logger.exception('load_tenants_failed', exc_info=e)
            messagebox.showerror('Error', f'Failed to load tenants:\n{e}')

    def on_tenant_select(self, event: tk.Event) -> None:
        """Handle tenant selection event."""
        selection = self.tenant_listbox.curselection()
        if not selection:
            return

        self.current_tenant = self.tenant_listbox.get(selection[0])
        logger.info('tenant_selected tenant=%s', self.current_tenant)

        # Clear previous chunks
        self.chunks_tree.delete(*self.chunks_tree.get_children())
        self.details_text.delete(1.0, tk.END)

        # Update status
        self.stats_text.delete(1.0, tk.END)
        self.stats_text.insert(
            tk.END, f'Selected Tenant: {self.current_tenant}\n\nClick "Load" to view data.'
        )

    def load_chunks(self) -> None:
        """Load and display chunks for the selected tenant."""
        if not self.client or not self.current_tenant:
            messagebox.showwarning('Warning', 'Please select a tenant first.')
            return

        try:
            collection = self.client.collections.get(self.current_collection)
            # Activate tenant (Weaviate Cloud Flex auto-offloads idle tenants)
            try:
                collection.tenants.update(tenants=[
                    Tenant(name=self.current_tenant, activity_status=TenantActivityStatus.ACTIVE)
                ])
            except Exception:
                pass
            tenant_collection = collection.with_tenant(self.current_tenant)

            # Fetch chunks in batches to avoid gRPC message size limit
            chunks = []
            batch_size = 50
            offset = 0
            while True:
                response = tenant_collection.query.fetch_objects(
                    limit=batch_size,
                    offset=offset,
                    include_vector=False,
                )
                if not response.objects:
                    break
                chunks.extend(response.objects)
                offset += batch_size
                if len(response.objects) < batch_size:
                    break

            # Clear treeview
            self.chunks_tree.delete(*self.chunks_tree.get_children())

            # Group chunks by commit SHA
            commits = {}
            for chunk in chunks:
                props = chunk.properties
                sha = props.get('commit_sha', 'Unknown')
                if sha not in commits:
                    commits[sha] = []
                commits[sha].append(chunk)

            # Populate treeview
            for sha, commit_chunks in sorted(commits.items()):
                first = commit_chunks[0].properties
                repo = first.get('repo_name', '')
                message = first.get('message', '')
                short_sha = sha[:12] if len(sha) > 12 else sha
                short_msg = message[:40] + '...' if len(message) > 40 else message

                # Add commit node
                commit_node = self.chunks_tree.insert(
                    '',
                    tk.END,
                    text=short_msg or f'Commit {short_sha}',
                    values=(short_sha, repo, '', ''),
                    tags=('document', sha),
                )

                # Add chunk rows under commit
                for chunk in sorted(commit_chunks, key=lambda c: c.properties.get('chunk_index', 0)):
                    props = chunk.properties
                    self.chunks_tree.insert(
                        commit_node,
                        tk.END,
                        text=f'Chunk {props.get("chunk_index", 0)}',
                        values=(
                            short_sha,
                            repo,
                            props.get('chunk_index', 0),
                            round(props.get('quality_score', 0.0), 2),
                        ),
                        tags=('chunk', str(chunk.uuid)),
                    )

            # Statistics
            total_quality = sum(c.properties.get('quality_score', 0.0) for c in chunks)
            total_complexity = sum(c.properties.get('complexity_score', 0.0) for c in chunks)
            repos = {c.properties.get('repo_name', '') for c in chunks}

            self.stats_text.delete(1.0, tk.END)
            stats = f"""Tenant: {self.current_tenant}
Total Commits: {len(commits)}
Total Chunks: {len(chunks)}
Repositories: {len(repos)}

Avg Quality Score: {f"{total_quality / len(chunks):.2f}" if chunks else 0}
Avg Complexity Score: {f"{total_complexity / len(chunks):.2f}" if chunks else 0}
"""
            self.stats_text.insert(tk.END, stats)

            logger.info('chunks_loaded tenant=%s total=%d commits=%d',
                        self.current_tenant, len(chunks), len(commits))

            # Store chunks for later reference
            self.current_chunks = {str(chunk.uuid): chunk for chunk in chunks}

        except Exception as e:
            logger.exception('load_chunks_failed', exc_info=e)
            messagebox.showerror('Error', f'Failed to load chunks:\n{e}')

    def on_chunk_select(self, event: tk.Event) -> None:
        """Handle chunk selection event."""
        selection = self.chunks_tree.selection()
        if not selection or not hasattr(self, 'current_chunks'):
            return

        item = self.chunks_tree.item(selection[0])
        tags = item.get('tags', [])

        # Find UUID in tags (second tag for chunks)
        chunk_uuid = None
        for tag in tags:
            if tag != 'chunk' and tag != 'document':
                chunk_uuid = tag
                break

        if not chunk_uuid or chunk_uuid not in self.current_chunks:
            self.details_text.delete(1.0, tk.END)
            self.details_text.insert(tk.END, 'No details available for this item.')
            return

        chunk = self.current_chunks[chunk_uuid]
        props = chunk.properties

        self.details_text.delete(1.0, tk.END)

        lines = [
            f'UUID: {chunk.uuid}',
            f'Commit SHA: {props.get("commit_sha", "")}',
            f'Repo: {props.get("repo_name", "")}',
            f'Author: {props.get("author", "")}',
            f'Chunk Index: {props.get("chunk_index", 0)}',
            f'Quality Score: {props.get("quality_score", 0.0)}',
            f'Complexity Score: {props.get("complexity_score", 0.0)}',
            f'Summary Score: {props.get("summary_score", 0.0)}',
            '',
            f'Tags: {", ".join(props.get("tags", []))}',
            '',
            f'Message:\n{"-" * 40}',
            props.get('message', ''),
            '',
            f'Quality Reasoning:\n{"-" * 40}',
            props.get('quality_reasoning', ''),
            '',
            f'Complexity Reasoning:\n{"-" * 40}',
            props.get('complexity_reasoning', ''),
            '',
            f'Summary Reasoning:\n{"-" * 40}',
            props.get('summary_reasoning', ''),
            '',
            f'Chunk Text:\n{"-" * 40}',
            props.get('chunk_text', ''),
            '',
            f'Diff:\n{"-" * 40}',
            props.get('diff', ''),
        ]

        self.details_text.insert(tk.END, '\n'.join(lines) + '\n')

    def show_context_menu(self, event: tk.Event) -> None:
        """Show context menu on right-click."""
        item = self.chunks_tree.identify_row(event.y)
        if item:
            self.chunks_tree.selection_set(item)
            self.context_menu.post(event.x_root, event.y_root)

    def delete_tenant(self) -> None:
        """Delete the selected tenant and all its data."""
        selection = self.tenant_listbox.curselection()
        if not selection:
            messagebox.showwarning('Warning', 'Please select a tenant to delete.')
            return

        tenant_name = self.tenant_listbox.get(selection[0])

        result = messagebox.askyesno(
            'Confirm Delete',
            f'Are you sure you want to delete tenant "{tenant_name}"?\n\n'
            f'This will permanently delete all commits for this tenant.\n'
            f'This action cannot be undone!',
            icon='warning',
        )

        if not result:
            return

        try:
            collection = self.client.collections.get(self.current_collection)
            collection.tenants.remove([tenant_name])

            import time
            max_wait = 30
            for i in range(max_wait):
                remaining = collection.tenants.get_by_names([tenant_name])
                if tenant_name not in remaining:
                    break
                time.sleep(1)
            else:
                logger.warning('tenant_delete_slow tenant=%s waited=%ds', tenant_name, max_wait)

            time.sleep(5)

            messagebox.showinfo('Success', f'Tenant "{tenant_name}" deleted successfully.')
            logger.info('tenant_deleted tenant=%s', tenant_name)

            self.load_tenants()
            self.chunks_tree.delete(*self.chunks_tree.get_children())
            self.details_text.delete(1.0, tk.END)
            self.current_tenant = None

        except Exception as e:
            logger.exception('delete_tenant_failed', exc_info=e)
            messagebox.showerror('Error', f'Failed to delete tenant:\n{e}')

    def delete_selected_item(self) -> None:
        """Delete the selected chunk or commit."""
        selection = self.chunks_tree.selection()
        if not selection or not hasattr(self, 'current_chunks'):
            messagebox.showwarning('Warning', 'Please select an item to delete.')
            return

        item = self.chunks_tree.item(selection[0])
        tags = item.get('tags', [])

        if 'document' in tags:
            self.delete_document()
            return

        chunk_uuid = None
        for tag in tags:
            if tag != 'chunk' and tag != 'document':
                chunk_uuid = tag
                break

        if not chunk_uuid or chunk_uuid not in self.current_chunks:
            messagebox.showwarning('Warning', 'Unable to identify the selected chunk.')
            return

        chunk = self.current_chunks[chunk_uuid]
        props = chunk.properties

        result = messagebox.askyesno(
            'Confirm Delete',
            f'Are you sure you want to delete this chunk?\n\n'
            f'SHA: {props.get("commit_sha", "N/A")[:20]}...\n'
            f'Chunk Index: {props.get("chunk_index", "N/A")}\n\n'
            f'This action cannot be undone!',
            icon='warning',
        )

        if not result:
            return

        try:
            collection = self.client.collections.get(self.current_collection)
            tenant_collection = collection.with_tenant(self.current_tenant)
            tenant_collection.data.delete_by_id(chunk.uuid)

            messagebox.showinfo('Success', 'Chunk deleted successfully.')
            logger.info('chunk_deleted uuid=%s tenant=%s', chunk.uuid, self.current_tenant)

            self.load_chunks()

        except Exception as e:
            logger.exception('delete_chunk_failed', exc_info=e)
            messagebox.showerror('Error', f'Failed to delete chunk:\n{e}')

    def delete_document(self) -> None:
        """Delete all chunks for the selected commit."""
        selection = self.chunks_tree.selection()
        if not selection:
            messagebox.showwarning('Warning', 'Please select a commit to delete.')
            return

        item = self.chunks_tree.item(selection[0])
        tags = item.get('tags', [])
        selected_item = selection[0]

        # Resolve commit SHA
        commit_sha = None
        if 'document' in tags:
            for tag in tags:
                if tag != 'document':
                    commit_sha = tag
                    break
        else:
            parent = self.chunks_tree.parent(selected_item)
            if parent:
                parent_tags = self.chunks_tree.item(parent).get('tags', [])
                for tag in parent_tags:
                    if tag != 'document':
                        commit_sha = tag
                        break

        if not commit_sha:
            messagebox.showwarning('Warning', 'Unable to identify the commit.')
            return

        chunk_count = sum(
            1 for chunk in self.current_chunks.values()
            if chunk.properties.get('commit_sha') == commit_sha
        )

        result = messagebox.askyesno(
            'Confirm Delete',
            f'Are you sure you want to delete this commit?\n\n'
            f'SHA: {commit_sha[:30]}\n'
            f'This will delete {chunk_count} chunk(s).\n\n'
            f'This action cannot be undone!',
            icon='warning',
        )

        if not result:
            return

        try:
            collection = self.client.collections.get(self.current_collection)
            tenant_collection = collection.with_tenant(self.current_tenant)

            deleted_count = 0
            for chunk_uuid, chunk in self.current_chunks.items():
                if chunk.properties.get('commit_sha') == commit_sha:
                    tenant_collection.data.delete_by_id(chunk.uuid)
                    deleted_count += 1

            messagebox.showinfo(
                'Success', f'Commit deleted successfully.\n{deleted_count} chunk(s) removed.'
            )
            logger.info('commit_deleted sha=%s chunks=%d tenant=%s',
                        commit_sha, deleted_count, self.current_tenant)

            self.load_chunks()

        except Exception as e:
            logger.exception('delete_commit_failed', exc_info=e)
            messagebox.showerror('Error', f'Failed to delete commit:\n{e}')

    def download_document(self) -> None:
        """Download all chunks for a commit as a JSON file."""
        selection = self.chunks_tree.selection()
        if not selection or not hasattr(self, 'current_chunks'):
            messagebox.showwarning('Warning', 'Please select a commit or chunk first.')
            return

        item = self.chunks_tree.item(selection[0])
        tags = item.get('tags', [])
        selected_item = selection[0]

        # Resolve commit SHA
        commit_sha = None
        if 'document' in tags:
            for tag in tags:
                if tag != 'document':
                    commit_sha = tag
                    break
        else:
            parent = self.chunks_tree.parent(selected_item)
            if parent:
                parent_tags = self.chunks_tree.item(parent).get('tags', [])
                for tag in parent_tags:
                    if tag != 'document':
                        commit_sha = tag
                        break

        if not commit_sha:
            messagebox.showwarning('Warning', 'Unable to identify the commit.')
            return

        commit_chunks = [
            chunk for chunk in self.current_chunks.values()
            if chunk.properties.get('commit_sha') == commit_sha
        ]

        if not commit_chunks:
            messagebox.showwarning('Warning', 'No chunks found for this commit.')
            return

        export_data = {
            'commit_sha': commit_sha,
            'tenant': self.current_tenant,
            'collection': self.current_collection,
            'exported_at': datetime.utcnow().isoformat() + 'Z',
            'summary': {'total_chunks': len(commit_chunks)},
            'chunks': [
                {
                    'uuid': str(chunk.uuid),
                    **{k: v for k, v in chunk.properties.items()},
                }
                for chunk in sorted(commit_chunks, key=lambda c: c.properties.get('chunk_index', 0))
            ],
        }

        safe_name = commit_sha[:20].replace('/', '_')
        file_path = filedialog.asksaveasfilename(
            defaultextension='.json',
            filetypes=[('JSON files', '*.json'), ('All files', '*.*')],
            initialfile=f'{safe_name}.json',
            title='Save Commit Export',
        )

        if not file_path:
            return

        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, indent=2, ensure_ascii=False)

            messagebox.showinfo(
                'Success',
                f'Commit exported successfully.\n\n'
                f'{len(commit_chunks)} chunk(s) saved to:\n{file_path}',
            )
            logger.info('commit_exported sha=%s chunks=%d path=%s',
                        commit_sha, len(commit_chunks), file_path)

        except Exception as e:
            logger.exception('export_commit_failed', exc_info=e)
            messagebox.showerror('Error', f'Failed to export commit:\n{e}')

    def edit_selected_chunk(self) -> None:
        """Open a dialog to edit the selected chunk's properties."""
        selection = self.chunks_tree.selection()
        if not selection or not hasattr(self, 'current_chunks'):
            messagebox.showwarning('Warning', 'Please select a chunk to edit.')
            return

        item = self.chunks_tree.item(selection[0])
        tags = item.get('tags', [])

        if 'document' in tags:
            messagebox.showinfo(
                'Info', 'Cannot edit commit nodes. Please select a specific chunk.'
            )
            return

        chunk_uuid = None
        for tag in tags:
            if tag != 'chunk' and tag != 'document':
                chunk_uuid = tag
                break

        if not chunk_uuid or chunk_uuid not in self.current_chunks:
            messagebox.showwarning('Warning', 'Unable to identify the selected chunk.')
            return

        chunk = self.current_chunks[chunk_uuid]
        props = chunk.properties

        dialog = ChunkEditDialog(self.root, chunk, props)
        self.root.wait_window(dialog.dialog)

        if dialog.result:
            try:
                collection = self.client.collections.get(self.current_collection)
                tenant_collection = collection.with_tenant(self.current_tenant)
                tenant_collection.data.update(
                    uuid=chunk.uuid,
                    properties=dialog.result,
                )

                messagebox.showinfo('Success', 'Chunk updated successfully.')
                logger.info('chunk_updated uuid=%s tenant=%s', chunk.uuid, self.current_tenant)

                self.load_chunks()

            except Exception as e:
                logger.exception('update_chunk_failed', exc_info=e)
                messagebox.showerror('Error', f'Failed to update chunk:\n{e}')

    def cleanup(self) -> None:
        """Clean up resources before closing."""
        if self.client:
            try:
                self.client.close()
                logger.info('weaviate_client_closed')
            except Exception as e:
                logger.exception('client_close_failed', exc_info=e)


def main() -> None:
    """Main entry point for the GUI application."""
    logging.basicConfig(level=logging.INFO)
    root = tk.Tk()
    app = WeaviateGUI(root)

    def on_closing() -> None:
        app.cleanup()
        root.destroy()

    root.protocol('WM_DELETE_WINDOW', on_closing)
    root.mainloop()


if __name__ == '__main__':
    main()
