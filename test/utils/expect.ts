export function expectUnauthorizedGqlErr(response: any) {
  expect(response.body?.errors).toBeArray();
  expect(response.body?.errors[0]).toEqual(
    expect.objectContaining({
      message: 'Unauthorized',
    })
  );
}

export function expectUserInputGqlErr({
  response,
  keys,
}: {
  response: any;
  keys: string[];
}) {
  expect(response.body?.errors).toBeArray();
  expect(response.body?.errors?.[0].extensions?.code).toEqual('BAD_USER_INPUT');
  expect(response.body?.errors?.[0].extensions?.response?.message).toEqual(
    expect.arrayContaining(keys.map((key) => expect.stringContaining(key)))
  );
}
