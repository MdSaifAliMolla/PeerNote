export const getCentralServerBaseUrl = () => {
  return process.env.NEXT_PUBLIC_CENTRAL_SERVER ?? 'http://localhost:8000';
};

export const getPeerServiceBaseUrl = () => {
  return process.env.NEXT_PUBLIC_PEER_SERVICE ?? 'http://localhost:8080';
};
