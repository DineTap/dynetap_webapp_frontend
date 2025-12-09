
export const getServerUser = async () => {
  return {
    user: {
      id: "mock_user_id",
      email: "demo@dynetap.com"
    },
    session: {
      access_token: "mock_token"
    }
  };
};
