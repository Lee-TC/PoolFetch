// This script aim to get the Uniswap V3 pool address

import { Log } from "@ethersproject/abstract-provider";
import { ethers } from "hardhat";
// const provider = new ethers.providers.WebSocketProvider('wss://eth-mainnet.g.alchemy.com/v2/J6sOsYZ78J7Q4dXjsl0JA3VXmeRllkHa')
const provider = new ethers.providers.WebSocketProvider('wss://polygon-mainnet.g.alchemy.com/v2/NC9g7iKtCj2pPLknFgtSwgBKiqzzZ18l')
const PoolCreatHash = "0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118"

const ERC20ABI = [
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
]

const UniswapV3PoolABI = [
    "function liquidity() external view returns (uint128)"
]


function parseData(element: Log) :[string,string,string] {
    const topics = element.topics
    const data = element.data
    const PoolAddress = ethers.utils.getAddress(data.slice(90, 130))
    const token0 = ethers.utils.getAddress(topics[1].slice(26, 66))
    const token1 = ethers.utils.getAddress(topics[2].slice(26, 66))
    return [PoolAddress, token0, token1];
}

async function getPoolFromUniV3(){
    const fs = require('fs')
    const csvWriter = require('csv-write-stream')
    const writer = csvWriter({headers: ["PoolAddress","Token0","Token1"]})
    writer.pipe(fs.createWriteStream('Polygon_pool.csv', {flags: 'a'}))

    const pool = await provider.getLogs({
        address: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        fromBlock: 39800000,// 16700000,
        toBlock: "latest",
        topics: [PoolCreatHash]
    })
    for (let i = 0; i < pool.length; i++) {
        const data = parseData(pool[i])
        try {
            const token0Info = await getTokenInfo(data[1])
            const token1Info = await getTokenInfo(data[2])
            const decimals = token0Info[1] + token1Info[1]
            const liquidity = ethers.BigNumber.from(await getPoolLiquidity(data[0]))
            const totalLiquidity = liquidity.pow(2).div(ethers.BigNumber.from(10).pow(decimals))
            if (totalLiquidity.gt(ethers.BigNumber.from(10).pow(8))) {
                writer.write([data[0], '('+token0Info+')'+data[1], '('+token1Info+')'+data[2]])
            }
        }
        catch (e) {
            console.log(e)
        }
    }
    writer.end()
}

async function getTokenInfo(address: string): Promise<[string,number]> {
    const token = new ethers.Contract(address, ERC20ABI, provider)
    const symbol = await token.symbol()
    const decimals = await token.decimals()
    return [symbol, decimals]
}

async function getPoolLiquidity(address: string): Promise<string> {
    const pool = new ethers.Contract(address, UniswapV3PoolABI, provider)
    const liquidity = await pool.liquidity()
    return liquidity
}

getPoolFromUniV3()
