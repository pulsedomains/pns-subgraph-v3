// Import types and APIs from graph-ts
import { BigInt, ByteArray, ethereum, log } from "@graphprotocol/graph-ts";
import { Account, Domain } from "./types/schema";

export function createEventID(event: ethereum.Event): string {
  return event.block.number
    .toString()
    .concat("-")
    .concat(event.logIndex.toString());
}

export const ETH_NODE =
  "0x55fb31aa6f23709345f51ac8d7e4ed79336defe55be2733bc226ed0f1f62f3c8";
export const ADDR_REVERSE_NODE =
  "0x91d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2";
export const ROOT_NODE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";
export const EMPTY_ADDRESS_BYTEARRAY = new ByteArray(20);

// Helper for concatenating two byte arrays
export function concat(a: ByteArray, b: ByteArray): ByteArray {
  let out = new Uint8Array(a.length + b.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i];
  }
  for (let j = 0; j < b.length; j++) {
    out[a.length + j] = b[j];
  }
  // return out as ByteArray
  return changetype<ByteArray>(out);
}

export function byteArrayFromHex(s: string): ByteArray {
  if (s.length % 2 !== 0) {
    throw new TypeError("Hex string must have an even number of characters");
  }
  let out = new Uint8Array(s.length / 2);
  for (var i = 0; i < s.length; i += 2) {
    out[i / 2] = parseInt(s.substring(i, i + 2), 16) as u32;
  }
  return changetype<ByteArray>(out);
}

export function uint256ToByteArray(i: BigInt): ByteArray {
  let hex = i.toHex().slice(2).padStart(64, "0");
  return byteArrayFromHex(hex);
}

export function createOrLoadAccount(address: string): Account {
  let account = Account.load(address);
  if (account == null) {
    account = new Account(address);
    account.save();
  }

  return account;
}

export function createOrLoadDomain(node: string): Domain {
  let domain = Domain.load(node);
  if (domain == null) {
    domain = new Domain(node);
    domain.save();
  }

  return domain;
}

export function checkValidLabel(name: string | null): boolean {
  if (name == null) {
    return false;
  }
  // for compiler
  name = name!;
  for (let i = 0; i < name.length; i++) {
    let charCode = name.charCodeAt(i);
    if (charCode === 0) {
      // 0 = null byte
      log.warning("Invalid label '{}' contained null byte. Skipping.", [name]);
      return false;
    } else if (charCode === 46) {
      // 46 = .
      log.warning(
        "Invalid label '{}' contained separator char '.'. Skipping.",
        [name]
      );
      return false;
    } else if (charCode === 91) {
      // 91 = [
      log.warning("Invalid label '{}' contained char '['. Skipping.", [name]);
      return false;
    } else if (charCode === 93) {
      // 93 = ]
      log.warning("Invalid label '{}' contained char ']'. Skipping.", [name]);
      return false;
    }
  }

  return true;
}
