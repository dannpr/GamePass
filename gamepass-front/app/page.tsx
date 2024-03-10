"use client"

import { Button, CircularProgress, Input, Link, Slider } from "@nextui-org/react";
import Image from "next/image";

import { useEffect, useState } from "react";
import { useAccount } from 'wagmi';

export default function Home() {
	const [showForm, setShowForm] = useState(false);
	const [amount, setAmount] = useState(50);
	const { address, isDisconnected } = useAccount();

	function isConnected(address: string) {
		localStorage.setItem("userAddress", address);
		console.log(address)
	}

	useEffect(() => {
		if (!isDisconnected && address) {
			isConnected(address);
		}
	}, [isDisconnected, address]);

	return (
		<main className="flex min-h-screen flex-col p-6">
			<div>
				<w3m-button />
			</div>
			<div className="flex flex-col items-center mt-48">
				<h1 className="text-6xl font-bold m-6">Game Pass</h1>
				{!showForm && (
					<Button className="text-white bg-indigo-400 m-6" onClick={() => setShowForm(true)}>Create a profile</Button>
				)}
				{showForm && (
					<div className="flex flex-col">
						<Input type="text" label="Username" className="my-2" />
						<Input type="number" label="Amount" value={amount.toString()} onChange={(e) => setAmount(parseInt(e.target.value))} className="my-2" /> {/* Associer la valeur de l'Input d'amount à l'état local */}
						<Slider
							key="secondary"
							color="secondary"
							step={1}
							maxValue={100}
							minValue={1}
							defaultValue={amount}
							onChange={(value) => {
								if (Array.isArray(value)) {
									setAmount(value[0]); 
								} else {
									setAmount(value);
								}
							}}
							aria-label="Temperature"
							className="max-w-md my-4"
						/>
						<Link href="dashboard" className="w-full justify-center"><Button className="text-white bg-indigo-400">Play</Button></Link>
					</div>
				)}
			</div>
		</main>
	);
}
