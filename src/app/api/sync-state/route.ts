import { GET as syncGET, POST as syncPOST } from "../sync/route";

export async function GET(request: Request) {
  return syncGET(request);
}

export async function POST(request: Request) {
  return syncPOST(request);
}
