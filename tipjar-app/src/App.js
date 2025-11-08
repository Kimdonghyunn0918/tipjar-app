import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "./contractABI.json";
import { CONTRACT_ADDRESS } from "./constants";

const App = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [totalTips, setTotalTips] = useState("0");
  const [tipAmount, setTipAmount] = useState("");
  const [message, setMessage] = useState("");
  const [txStatus, setTxStatus] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const _provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(_provider);
        const signer = _provider.getSigner();
        setAccount(await signer.getAddress());
        const _contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
        setContract(_contract);
        setTxStatus("지갑 연결됨");
      } catch (err) {
        setTxStatus("연결 실패");
      }
    }
  };

  const fetchTotalTips = async () => {
    if (contract) {
      const tips = await contract.getTotalTips();
      setTotalTips(ethers.utils.formatEther(tips));
    }
  };

  const sendTip = async () => {
    if (!contract || !tipAmount) return;
    setTxStatus("팁 전송 중...");
    try {
      const tx = await contract.deposit(message, {
        value: ethers.utils.parseEther(tipAmount)
      });
      await tx.wait();
      setTxStatus("팁 전송 완료!");
      setTipAmount("");
      setMessage("");
      fetchTotalTips();
    } catch (e) {
      setTxStatus("전송 실패");
    }
  };

  const withdraw = async () => {
    if (!contract) return;
    setTxStatus("인출 중...");
    try {
      const tx = await contract.withdraw();
      await tx.wait();
      setTxStatus("인출 완료!");
      fetchTotalTips();
    } catch (e) {
      setTxStatus("인출 실패");
    }
  };

  useEffect(() => {
    if (contract) fetchTotalTips();
  }, [contract]);

  return (
    <div style={{ minHeight: "100vh", background: "#151c28", color: "white", textAlign: "center", padding: 40, fontFamily: "sans-serif" }}>
      <h1>TipJar DApp</h1>
      <div style={{ color: "#cfcfcf", marginBottom: 10, fontSize: 20 }}>92113504 김동헌</div>
      <button onClick={connectWallet} style={{ background: "#4247a4", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer" }}>
        {account ? `연결됨: ${account.slice(0, 6)}...` : "지갑 연결"}
      </button>
      <div style={{ background: "#232b3a", display: "inline-block", padding: 32, borderRadius: 18, minWidth: 340, marginTop: 20 }}>
        <div style={{ fontSize: 22, marginBottom: 10 }}>총 팁: {totalTips} ETH</div>
        <input
          placeholder="팁 금액 (ETH)"
          value={tipAmount}
          onChange={(e) => setTipAmount(e.target.value)}
          style={{ width: "80%", padding: 10, marginBottom: 10, borderRadius: 6 }}
        />
        <input
          placeholder="메시지"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: "80%", padding: 10, marginBottom: 10, borderRadius: 6 }}
        />
        <button onClick={sendTip} disabled={!contract} style={{ background: "#27ae60", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, marginRight: 10 }}>
          팁 보내기
        </button>
        <button onClick={withdraw} disabled={!contract} style={{ background: "#f39c12", color: "white", border: "none", padding: "10px 20px", borderRadius: 8 }}>
          인출
        </button>
        {txStatus && <div style={{ marginTop: 10, color: txStatus.includes("실패") ? "#ff6b6b" : "#a0e7a0" }}>{txStatus}</div>}
      </div>
    </div>
  );
};

export default App;
