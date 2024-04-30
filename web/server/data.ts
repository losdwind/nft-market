import { createPublicClient, createWalletClient, http, parseAbi, parseAbiItem } from 'viem'
import { mainnet, sepolia } from 'viem/chains'

import { formatUnits } from 'viem'


const publicClient
 = createPublicClient({ 
  chain: mainnet,
  transport: http("https://rpc.particle.network/evm-chain?chainId=1&projectUuid=5cf89b55-8b00-4c19-9844-7729a490a5a2&projectKey=cR2VL9YnJzoWbT2Zgow5W728kUecEuTciTpwKBQO")
})


const transferEvent = parseAbiItem(
    'event Transfer(address indexed from, address indexed to, uint256 value)')


var startBlock = BigInt(0);
(async () => {
    startBlock = await publicClient.getBlockNumber();
    console.log(startBlock);
})();


setInterval(async () =>{
    const currentBlock = await publicClient.getBlockNumber()
    if (currentBlock > startBlock) {
        const filter = await publicClient.createEventFilter(
            {
                address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                event: transferEvent,
                fromBlock: startBlock,
                toBlock: currentBlock,
                strict:true
            },
        )
        const logs = await publicClient.getFilterLogs({filter})
        startBlock = currentBlock
        logs.forEach((log) => {
            console.log(`从${log.args.from} 转账给 ${log.args.to} ${formatUnits(log.args.value, 6)  } USDC ,交易ID：${log.transactionHash}`)
        })
    }


}, 2000 )
