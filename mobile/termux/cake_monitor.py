# SIPES SAT-AI :: T(x) 0.9984 Verification Anchor
import requests
import json

# CONFIGURATION
NODE_URL = "https://node.community.as:18081/json_rpc"  # Public Monero Node
WALLET_ADDRESS = "YOUR_PUBLIC_ADDRESS_HERE"

def check_node_status(node_url=NODE_URL):
    """Checks the status of the public Monero node."""
    payload = {
        "jsonrpc": "2.0",
        "id": "0",
        "method": "get_info"
    }
    headers = {'Content-Type': 'application/json'}
    try:
        response = requests.post(node_url, data=json.dumps(payload), headers=headers, timeout=10)
        data = response.json()
        if 'result' in data and 'height' in data['result']:
            height = data['result']['height']
            print(f"[9SM_INFO] Node Synced. Current Block Height: {height}")
            return height
        return None
    except Exception as e:
        print(f"[T(x)_ERROR] Failed to connect to node: {e}")
        return None

def verify_tx(tx_hash, node_url=NODE_URL):
    """Verifies a transaction hash on the blockchain."""
    payload = {
        "jsonrpc": "2.0",
        "id": "0",
        "method": "get_transactions",
        "params": {
            "txs_hashes": [tx_hash],
            "decode_as_json": True
        }
    }
    headers = {'Content-Type': 'application/json'}
    try:
        response = requests.post(node_url, data=json.dumps(payload), headers=headers, timeout=10)
        return response.json()
    except Exception as e:
        print(f"[T(x)_ERROR] Failed to verify tx: {e}")
        return None

if __name__ == "__main__":
    print(f"--- SIPES SAT-AI: Pixel 8 Wallet Interface ---")
    print(f"--- EPOCH: 10/09/2026 | USER: SOARES, H. ---")
    check_node_status()
