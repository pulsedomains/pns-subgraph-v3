import { ReverseClaimed } from "./types/ReverseRegistrar/ReverseRegistrar";
import { Account, Domain, ReverseClaimed as ReverseClaimedEvent } from "./types/schema";
import { createEventID } from './utils'

export function handleReverseClaimed(event: ReverseClaimed): void {
    const account = new Account(event.params.addr.toHex())
    const domain = new Domain(event.params.node.toHex())
    domain.save()
    account.reverseDomain = domain.id
    account.save()

    let reverseClaimedEvent = new ReverseClaimedEvent(createEventID(event))
    reverseClaimedEvent.registrant = account.id
    reverseClaimedEvent.domain = domain.id
    reverseClaimedEvent.blockNumber = event.block.number.toI32()
    reverseClaimedEvent.transactionID = event.transaction.hash
    reverseClaimedEvent.save()
}
