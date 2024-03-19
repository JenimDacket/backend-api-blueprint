export const isBigInt = (str: string): boolean => {
  try {
    BigInt(str);
    return true;
  } catch (e) {
    return false;
  }
};
