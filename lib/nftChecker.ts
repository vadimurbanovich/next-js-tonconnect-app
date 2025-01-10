interface CollectionItem {
  address: string;
}

interface NftItem {
  id: string;
  collection: CollectionItem;
}

interface GraphQLResponse {
  data: {
    nftItemsByOwner: {
      items: NftItem[];
      cursor: string | null;
    };
  };
  errors?: {
    message: string;
  }[];
}

class NFTChecker {
  private collectionAddress: string;
  private graphqlEndpoint: string;
  private readonly maxPages: number;

  constructor() {
    if (!process.env.COLLECTION_ADDRESS) {
      throw new Error(
        "COLLECTION_ADDRESS is not defined in the environment variables"
      );
    }

    this.collectionAddress = process.env.COLLECTION_ADDRESS.toLowerCase();
    this.graphqlEndpoint = "https://api.getgems.io/graphql";
    this.maxPages = 50; 
  }

  async checkNFT(walletAddress: string): Promise<boolean> {
    let hasNextPage: boolean = true;
    let afterCursor: string | null = null;
    let currentPage: number = 0;

    try {
      while (hasNextPage && currentPage < this.maxPages) {
        const query: string = `
          query {
            nftItemsByOwner(ownerAddress: "${walletAddress}", first: 100, after: ${
          afterCursor ? `"${afterCursor}"` : "null"
        }) {
              items {
                id
                collection {
                  address
                }
              }
              cursor
            }
          }
        `;

        const response: Response = await fetch(this.graphqlEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          return false;
        }

        const data: GraphQLResponse = await response.json();

        console.log(
          "GraphQL Response Data (Page",
          currentPage + 1,
          "):",
          JSON.stringify(data, null, 2)
        );

        if (data.errors && data.errors.length > 0) {
          console.error("GraphQL Error:", data.errors);
          return false;
        }

        const nftItems: NftItem[] = data.data.nftItemsByOwner.items;

        const hasTargetCollection = nftItems.some(
          (item) =>
            item.collection.address.toLowerCase() === this.collectionAddress
        );

        if (hasTargetCollection) {
          return true;
        }

        afterCursor = data.data.nftItemsByOwner.cursor;
        hasNextPage = !!afterCursor;
        currentPage += 1;
      }

      return false;
    } catch (error: unknown) {
      console.error("Error checking NFT:", (error as Error).message);
      return false;
    }
  }
}

export default NFTChecker;
  