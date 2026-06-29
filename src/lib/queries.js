export const GET_PRODUCTS = `
  query GetProducts($first: Int!, $country: CountryCode!) @inContext(country: $country) {
    products(first: $first) {
      edges { node {
        id title handle description vendor tags
        priceRange { minVariantPrice { amount currencyCode } }
        variants(first: 10) { edges { node { id title availableForSale price { amount currencyCode } } } }
        images(first: 5) { edges { node { url altText } } }
        featuredImage { url altText }
      }}
    }
  }
`

export const GET_COLLECTIONS = `
  query GetCollections {
    collections(first: 10) {
      edges { node {
        id handle title description
        image { url altText }
        products(first: 4) {
          edges { node {
            id title handle
            priceRange { minVariantPrice { amount currencyCode } }
            featuredImage { url altText }
          }}
        }
      }}
    }
  }
`

export const GET_COLLECTION_PRODUCTS = `
  query GetCollectionProducts($handle: String!, $country: CountryCode!) @inContext(country: $country) {
    collection(handle: $handle) {
      id title description handle
      image { url altText }
      products(first: 20) {
        edges { node {
          id title handle description tags
          priceRange { minVariantPrice { amount currencyCode } }
          featuredImage { url altText }
          images(first: 3) { edges { node { url altText } } }
          variants(first: 10) { edges { node { id title availableForSale price { amount currencyCode } } } }
        }}
      }
    }
  }
`

export const SEARCH_PRODUCTS = `
  query SearchProducts($query: String!, $country: CountryCode!) @inContext(country: $country) {
    products(first: 20, query: $query) {
      edges { node {
        id title handle
        priceRange { minVariantPrice { amount currencyCode } }
        featuredImage { url altText }
        variants(first: 1) { edges { node { id availableForSale } } }
      }}
    }
  }
`

export const CREATE_CART = `
  mutation CartCreate($lines: [CartLineInput!], $country: CountryCode!) @inContext(country: $country) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id checkoutUrl
        lines(first: 10) { edges { node {
          id quantity
          merchandise { ... on ProductVariant {
            id title
            product { title }
            price { amount currencyCode }
          }}
        }}}
        cost { totalAmount { amount currencyCode } }
      }
    }
  }
`

export const ADD_CART_LINES = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!, $country: CountryCode!) @inContext(country: $country) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id checkoutUrl
        lines(first: 10) { edges { node {
          id quantity
          merchandise { ... on ProductVariant {
            id title
            product { title }
            price { amount currencyCode }
          }}
        }}}
        cost { totalAmount { amount currencyCode } }
      }
    }
  }
`

export const UPDATE_CART_LINES = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!, $country: CountryCode!) @inContext(country: $country) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id checkoutUrl
        lines(first: 10) { edges { node {
          id quantity
          merchandise { ... on ProductVariant {
            id title
            product { title }
            price { amount currencyCode }
          }}
        }}}
        cost { totalAmount { amount currencyCode } }
      }
    }
  }
`

export const REMOVE_CART_LINES = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!, $country: CountryCode!) @inContext(country: $country) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id checkoutUrl
        lines(first: 10) { edges { node {
          id quantity
          merchandise { ... on ProductVariant {
            id title
            product { title }
            price { amount currencyCode }
          }}
        }}}
        cost { totalAmount { amount currencyCode } }
      }
    }
  }
`
