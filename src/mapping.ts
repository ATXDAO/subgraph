import { ATXDAONFT_V2, Transfer } from '../generated/ATXDAONFT_V2/ATXDAONFT_V2';
import { Member, Token } from '../generated/schema';

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
  if (oldMember && oldMember.tokens.entries.length === 1) {
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
