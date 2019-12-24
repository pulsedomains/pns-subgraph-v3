// Import types and APIs from graph-ts
import {
  BigInt,
  ByteArray,
  EthereumEvent,
} from '@graphprotocol/graph-ts'
// Import entity types generated from the GraphQL schema
import { Domain, Registration } from './types/schema'

export function createEventID(event: EthereumEvent): string {
  return event.block.number.toString().concat('-').concat(event.logIndex.toString())
}

export const ROOT_NODE = '0x0000000000000000000000000000000000000000000000000000000000000000'
export const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'

export function loadOrCreateDomain(node:string): Domain {
  let domain = Domain.load(node)
  if (domain == null){
    domain = new Domain(node)
    if(node == ROOT_NODE){
      domain.owner = EMPTY_ADDRESS
    }
  }
  return domain as Domain
}

export function loadOrCreateRegistration(label:string): Registration {
  let registration = Registration.load(label)
  
  if (registration == null){
    registration = new Registration(label)
  }
  return registration as Registration
}

// Helper for concatenating two byte arrays
export function concat(a: ByteArray, b: ByteArray): ByteArray {
  let out = new Uint8Array(a.length + b.length)
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i]
  }
  for (let j = 0; j < b.length; j++) {
    out[a.length + j] = b[j]
  }
  return out as ByteArray
}

export function byteArrayFromHex(s: string): ByteArray {
  if(s.length % 2 !== 0) {
    throw new TypeError("Hex string must have an even number of characters")
  }
  let out = new Uint8Array(s.length / 2)
  for(var i = 0; i < s.length; i += 2) {
    out[i / 2] = parseInt(s.substring(i, i + 2), 16) as u32
  }
  return out as ByteArray;
}

export function uint256ToByteArray(i: BigInt): ByteArray {
  let hex = i.toHex().slice(2).padStart(64, '0')
  return byteArrayFromHex(hex)
}
