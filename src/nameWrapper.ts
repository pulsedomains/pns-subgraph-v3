// Import types and APIs from graph-ts
import {
  Bytes, store
} from '@graphprotocol/graph-ts'
// Import event types from the registry contract ABI
import {
  FusesSet as FusesSetEvent, NameUnwrapped as NameUnwrappedEvent, NameWrapped as NameWrappedEvent
} from './types/NameWrapper/NameWrapper'
// Import entity types generated from the GraphQL schema
import { Account, Domain, FusesSet, NameUnwrapped, NameWrapped, WrappedDomain } from './types/schema'
import { concat, createEventID, createOrLoadAccount } from './utils'

function decodeName (buf:Bytes):Array<string> {
  let offset = 0
  let list = Bytes.fromHexString('')
  let dot = Bytes.fromHexString('2e')
  let len = buf[offset++]
  let hex = buf.toHexString()
  let firstLabel = ''
  if (len === 0) {
    return [firstLabel, '.']
  }
  
  while (len) {
    let label = hex.slice((offset +1 ) * 2, (offset + 1 + len ) * 2)
    let labelBytes = Bytes.fromHexString(label)
  
    if(offset > 1){
      list = concat(list, dot)
    }else{
      firstLabel = labelBytes.toString()
    }
    list = concat(list, labelBytes)
    offset += len
    len = buf[offset++]
  }
  return [firstLabel, list.toString()]
}

export function handleNameWrapped(event: NameWrappedEvent): void {
  let decoded = decodeName(event.params.name)
  let label = decoded[0]
  let name = decoded[1]
  let node = event.params.node
  let fuses = event.params.fuses
  let blockNumber = event.block.number.toI32()
  let transactionID = event.transaction.hash
  let owner = createOrLoadAccount(event.params.owner.toHex())
  let domain = Domain.load(node.toHex())!

  if(!domain.labelName){
    domain.labelName = label
    domain.name = name
  }
  domain.save()

  let wrappedDomain = new WrappedDomain(node.toHex())
  wrappedDomain.domain = domain.id
  wrappedDomain.expiryDate = event.params.expiry
  wrappedDomain.fuses = fuses
  wrappedDomain.owner = owner.id
  wrappedDomain.labelName = name
  wrappedDomain.save()

  let nameWrappedEvent = new NameWrapped(createEventID(event))  
  nameWrappedEvent.domain = domain.id
  nameWrappedEvent.name = name
  nameWrappedEvent.fuses = fuses
  nameWrappedEvent.owner = owner.id
  nameWrappedEvent.blockNumber = blockNumber
  nameWrappedEvent.transactionID = transactionID
  nameWrappedEvent.save()
}

export function handleNameUnwrapped(event: NameUnwrappedEvent): void {
  let node = event.params.node
  let blockNumber = event.block.number.toI32()
  let transactionID = event.transaction.hash
  let owner = createOrLoadAccount(event.params.owner.toHex())

  let nameUnwrappedEvent = new NameUnwrapped(createEventID(event))  
  nameUnwrappedEvent.domain = node.toHex()
  nameUnwrappedEvent.owner = owner.id
  nameUnwrappedEvent.blockNumber = blockNumber
  nameUnwrappedEvent.transactionID = transactionID
  nameUnwrappedEvent.save()

  store.remove('WrappedDomain', node.toHex())
}

export function handleFusesSet(event: FusesSetEvent): void {
  let node = event.params.node
  let fuses = event.params.fuses
  let expiry = event.params.expiry
  let blockNumber = event.block.number.toI32()
  let transactionID = event.transaction.hash
  let wrappedDomain = WrappedDomain.load(node.toHex())!
  wrappedDomain.fuses = fuses
  wrappedDomain.expiryDate = expiry
  wrappedDomain.save()
  let fusesBurnedEvent = new FusesSet(createEventID(event))  
  fusesBurnedEvent.domain = node.toHex()
  fusesBurnedEvent.fuses = fuses
  fusesBurnedEvent.blockNumber = blockNumber
  fusesBurnedEvent.transactionID = transactionID
  fusesBurnedEvent.save()
}
