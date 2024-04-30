import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  Transfer as TransferEvent,
} from "../generated/S2NFT/S2NFT"
import { Approval, ApprovalForAll, Transfer, TokenInfo } from "../generated/schema"
import { S2NFT } from "../generated/S2NFT/S2NFT"

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.owner = event.params.owner
  entity.approved = event.params.approved
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.approved = event.params.approved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // trigger tokeninfo save
  tokenInfo(event)

}


// type TokenInfo @entity {
//   id: ID!
//   ca: Bytes! # address
//   tokenId: BigInt! # uint256
//   tokenURL: String!
//   name: String!
//   owner: Bytes! # address
//   blockNumber: BigInt!
//   blockTimestamp: BigInt!
//   transactionHash: Bytes!
// }

function tokenInfo(event: TransferEvent) {

  // initialize s2nf contract to read name and tokenURL
  let contract = S2NFT.bind(event.address)

  // prepare data
  let nftName = contract.name()
  let tokenId = event.params.tokenId
  let tokenURI = contract.tokenURI(tokenId)
  let tokenInfo = new TokenInfo(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString(),
  )

  // save data
  tokenInfo.ca = event.address,
  tokenInfo.tokenId = tokenId,
  tokenInfo.tokenURL = tokenURI,
  tokenInfo.name = nftName,
  tokenInfo.owner = event.params.to,
  tokenInfo.blockNumber = event.block.number,
  tokenInfo.blockTimestamp = event.block.timestamp,
  tokenInfo.transactionHash = event.transaction.hash

  tokenInfo.save();
}

