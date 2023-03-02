import { ethers } from "hardhat"
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'

// wss provider
// const provider = new ethers.providers.WebSocketProvider('wss://eth-mainnet.g.alchemy.com/v2/J6sOsYZ78J7Q4dXjsl0JA3VXmeRllkHa')
const provider = new ethers.providers.WebSocketProvider('wss://polygon-mainnet.g.alchemy.com/v2/NC9g7iKtCj2pPLknFgtSwgBKiqzzZ18l')

const QUOTER_CONTRACT_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
const quoter = new ethers.Contract(QUOTER_CONTRACT_ADDRESS, Quoter.abi, provider)

async function getQuoter() :Promise<string>{
    const qouterAmount = await quoter.callStatic.quoteExactInputSingle(
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "500",
        "1000000000000000000",
        "0"
    )
    return qouterAmount
}

function main() {
    provider.on('block', async (blockNumber) => {
        getQuoter().then((res) => {
            console.log("At block " + blockNumber + " the price is " + res)
        })
    })
}

main()
