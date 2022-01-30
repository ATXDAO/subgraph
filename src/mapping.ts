import { BigInt } from '@graphprotocol/graph-ts';
import { ATXDAONFT_V2, Transfer } from '../generated/ATXDAONFT_V2/ATXDAONFT_V2';
import { Member, Token } from '../generated/schema';

// export function handleApproval(event: Approval): void {
//   // Entities can be loaded from the store using a string ID; this ID
//   // needs to be unique across all entities of the same type
//   let entity = ExampleEntity.load(event.transaction.from.toHex());

//   // Entities only exist after they have been saved to the store;
//   // `null` checks allow to create entities on demand
//   if (!entity) {
//     entity = new ExampleEntity(event.transaction.from.toHex());

//     // Entity fields can be set using simple assignments
//     entity.count = BigInt.fromI32(0);
//   }

//   // BigInt and BigDecimal math are supported
//   entity.count = entity.count + BigInt.fromI32(1);

//   // Entity fields can be set based on event parameters
//   entity.owner = event.params.owner;
//   entity.approved = event.params.approved;

//   // Entities can be written to the store with `.save()`
//   entity.save();

//   // Note: If a handler doesn't require existing field values, it is faster
//   // _not_ to load the entity from the store. Instead, create it fresh with
//   // `new Entity(...)`, set the fields that should be updated and save the
//   // entity back to the store. Fields that were not set or unset remain
//   // unchanged, allowing for partial updates to be applied.

//   // It is also possible to access smart contracts from mappings. For
//   // example, the contract that has emitted the event can be connected to
//   // with:
//   //
//   // let contract = Contract.bind(event.address)
//   //
//   // The following functions can then be called on this contract to access
//   // state variables and other data:
//   //
//   // - contract._mintPrice(...)
//   // - contract.balanceOf(...)
//   // - contract.baseExtension(...)
//   // - contract.getApproved(...)
//   // - contract.hasMinted(...)
//   // - contract.isApprovedForAll(...)
//   // - contract.isMintable(...)
//   // - contract.name(...)
//   // - contract.owner(...)
//   // - contract.ownerOf(...)
//   // - contract.supportsInterface(...)
//   // - contract.symbol(...)
//   // - contract.tokenURI(...)
// }

export function handleTransfer(event: Transfer): void {
  const params = event.params;
  const timestamp = event.block.timestamp;

  // save token
  let token = Token.load(params.tokenId.toHex());
  if (!token) {
    token = new Token(params.tokenId.toHex());
    token.createdAt = timestamp;
  }
  token.owner = params.to.toHex();
  token.save();

  // remove old member if last token
  let oldMember = Member.load(params.from.toHex());
  if (oldMember && oldMember.tokens.length === 1) {
    oldMember.isActive = false;
    oldMember.save();
  }

  // find or create new member
  let newMember = Member.load(params.to.toHex());
  if (!newMember) {
    newMember = new Member(params.to.toHex());
    newMember.createdAt = timestamp;
  }
  newMember.isActive = true;
  newMember.save();
}
