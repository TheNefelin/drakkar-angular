export default async (req, res) => {
  const { reqHandler } = await import(
    '../dist/drakar-angular/server/server.mjs'
  );

  return reqHandler(req, res);
};
