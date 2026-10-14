import pytest
from unittest.mock import patch, MagicMock
from mobile.termux.cake_monitor import check_node_status, verify_tx

def test_check_node_status_success():
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "result": {
            "height": 3000000
        }
    }
    with patch("requests.post", return_value=mock_response):
        height = check_node_status("http://mock-node")
        assert height == 3000000

def test_check_node_status_failure():
    with patch("requests.post", side_effect=Exception("Connection Error")):
        height = check_node_status("http://mock-node")
        assert height is None

def test_verify_tx_success():
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "result": {
            "status": "OK"
        }
    }
    with patch("requests.post", return_value=mock_response):
        res = verify_tx("dummy_tx_hash", "http://mock-node")
        assert res == {"result": {"status": "OK"}}
