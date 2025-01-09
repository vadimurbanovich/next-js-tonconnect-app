interface NFTItem {
  collection: {
    address: string;
  };
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface GraphQLResponse {
  data: {
    nftItemsByOwner: {
      items: NFTItem[];
      pageInfo: PageInfo;
    };
  };
  errors?: {
    message: string;
  }[];
}

class NFTChecker {
  private collectionAddress: string;
  private graphqlEndpoint: string;

  constructor() {
    if (!process.env.COLLECTION_ADDRESS) {
      throw new Error(
        "COLLECTION_ADDRESS is not defined in the environment variables"
      );
    }

    this.collectionAddress = process.env.COLLECTION_ADDRESS;
    this.graphqlEndpoint = "https://api.getgems.io/graphql";
  }

  async checkNFT(walletAddress: string): Promise<boolean> {
    let hasNextPage: boolean = true;
    let afterCursor: string | null = null;

    try {
      while (hasNextPage) {
        const query: string = `
          query {
            nftItemsByOwner(ownerAddress: "${walletAddress}", first: 50, after: ${
          afterCursor ? `"${afterCursor}"` : null
        }) {
              items {
                collection {
                  address
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `;

        const response: Response = await fetch(this.graphqlEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          console.error(
            `HTTP Error: ${response.status} ${response.statusText}`
          );
          return false;
        }

        const data: GraphQLResponse = await response.json();

        if (data.errors && data.errors.length > 0) {
          console.error("GraphQL Error:", data.errors);
          return false;
        }

        const nftItems: NFTItem[] = data.data.nftItemsByOwner.items;

        if (
          nftItems.some(
            (item) => item.collection.address === this.collectionAddress
          )
        ) {
          return true;
        }

        const pageInfo: PageInfo = data.data.nftItemsByOwner.pageInfo;
        hasNextPage = pageInfo.hasNextPage;
        afterCursor = pageInfo.endCursor;
      }

      return false;
    } catch (error: unknown) {
      console.error("Error checking NFT:", (error as Error).message);
      return false;
    }
  }
}

export default NFTChecker;
