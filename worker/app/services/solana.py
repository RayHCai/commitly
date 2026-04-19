import logging

from solana.rpc.api import Client
from solders.instruction import Instruction
from solders.keypair import Keypair
from solders.message import Message
from solders.pubkey import Pubkey
from solders.transaction import Transaction

from app.config import settings

logger = logging.getLogger(__name__)

MEMO_PROGRAM_ID = Pubkey.from_string("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr")
SOLANA_DEVNET_URL = "https://api.devnet.solana.com"

_client: Client | None = None
_keypair: Keypair | None = None


def _get_keypair() -> Keypair:
    global _keypair
    if _keypair is None:
        if not settings.SOLANA_PRIVATE_KEY:
            raise ValueError("SOLANA_PRIVATE_KEY is not configured")
        _keypair = Keypair.from_base58_string(settings.SOLANA_PRIVATE_KEY)
    return _keypair


def _get_client() -> Client:
    global _client
    if _client is None:
        _client = Client(SOLANA_DEVNET_URL)
    return _client


def send_memo(message: str) -> str:
    """Send a memo transaction to Solana devnet.

    Returns the transaction signature as a string.
    """
    keypair = _get_keypair()
    client = _get_client()

    memo_ix = Instruction(
        program_id=MEMO_PROGRAM_ID,
        accounts=[],
        data=message.encode("utf-8"),
    )

    recent_blockhash = client.get_latest_blockhash().value.blockhash

    msg = Message.new_with_blockhash(
        [memo_ix],
        keypair.pubkey(),
        recent_blockhash,
    )

    tx = Transaction.new_unsigned(msg)
    tx.sign([keypair], recent_blockhash)

    result = client.send_transaction(tx)
    signature = str(result.value)

    logger.info(f"Memo transaction sent: {signature}")
    return signature
