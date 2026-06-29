import { useState, useEffect } from 'react'
import { shopifyClient, COUNTRY_CODE } from '../lib/shopify'
import { GET_PRODUCTS, GET_COLLECTIONS, GET_COLLECTION_PRODUCTS } from '../lib/queries'

export function useProducts(count = 12) {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  useEffect(() => {
    shopifyClient.request(GET_PRODUCTS, { variables: { first: count, country: COUNTRY_CODE } })
      .then(({ data }) => setProducts(data?.products?.edges?.map(e => e.node) || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [count])
  return { products, loading }
}

export function useCollections() {
  const [collections, setCollections] = useState([])
  const [loading,     setLoading]     = useState(true)
  useEffect(() => {
    shopifyClient.request(GET_COLLECTIONS)
      .then(({ data }) => setCollections(data?.collections?.edges?.map(e => e.node) || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])
  return { collections, loading }
}

export function useCollection(handle) {
  const [collection, setCollection] = useState(null)
  const [loading,    setLoading]    = useState(true)
  useEffect(() => {
    if (!handle) return
    setLoading(true)
    shopifyClient.request(GET_COLLECTION_PRODUCTS, { variables: { handle, country: COUNTRY_CODE } })
      .then(({ data }) => setCollection(data?.collection || null))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [handle])
  return { collection, loading }
}
