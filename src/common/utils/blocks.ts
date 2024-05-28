import { blocksToTimestamp, timestampToBlocks } from 'ergo-dex-sdk-custom';
import { DateTime } from 'luxon';

export const dateTimeToBlock = (
  currentHeight: number,
  dateTime: DateTime,
): number => timestampToBlocks(currentHeight, dateTime.toMillis());

export const blockToDateTime = (
  currentHeight: number,
  block: number,
): DateTime =>
  DateTime.fromMillis(Number(blocksToTimestamp(currentHeight, block)));
