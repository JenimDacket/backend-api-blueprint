const initResultHandler = (error: Error): void => {
  if (error) {
    throw error;
  }
};

export { initResultHandler };
