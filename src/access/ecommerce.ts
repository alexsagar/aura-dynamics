import type { Access, FieldAccess, Where } from 'payload'

/**
 * isAdmin: Return true only when user.collection === 'users'
 */
export const isAdmin: Access = ({ req: { user } }) => {
  return Boolean(user && user.collection === 'users')
}

/**
 * isAuthenticated: Return true for any logged-in Payload auth user
 */
export const isAuthenticated: Access = ({ req: { user } }) => {
  return Boolean(user)
}

/**
 * isCustomer: Field-level access that returns true only for the customers collection
 */
export const isCustomer: FieldAccess = ({ req: { user } }) => {
  return Boolean(user && user.collection === 'customers')
}

/**
 * adminOnlyFieldAccess: Allow only users from the users collection
 */
export const adminOnlyFieldAccess: FieldAccess = ({ req: { user } }) => {
  return Boolean(user && user.collection === 'users')
}

/**
 * adminOrPublishedStatus:
 * Admins get full access (true).
 * Public/customer users can only access documents where _status === 'published'.
 */
export const adminOrPublishedStatus: Access = ({ req: { user } }) => {
  if (user && user.collection === 'users') {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}

/**
 * isDocumentOwner:
 * Admins receive full access (true).
 * Customers can only access documents where the document's customer field equals their own user ID.
 */
export const isDocumentOwner: Access = ({ req: { user } }) => {
  if (user && user.collection === 'users') {
    return true
  }

  if (user && user.collection === 'customers') {
    return {
      customer: {
        equals: user.id,
      },
    }
  }

  return false
}

/**
 * Storefront scope: product types the public can discover and buy. Other types
 * (3D prints) stay in Payload for admins and historical orders but are hidden
 * from every public read and rejected at checkout.
 */
export const PUBLIC_PRODUCT_TYPES = ['filament'] as const

export const publicProductWhere: Where = {
  and: [{ _status: { equals: 'published' } }, { productType: { in: [...PUBLIC_PRODUCT_TYPES] } }],
}

export const isPublicProduct = (p: { _status?: string | null; productType?: string | null } | null | undefined) =>
  p?._status === 'published' && (PUBLIC_PRODUCT_TYPES as readonly string[]).includes(p.productType ?? '')

/** Products read: admins see everything; everyone else only public, published products. */
export const productReadAccess: Access = ({ req: { user } }) =>
  user && user.collection === 'users' ? true : publicProductWhere

/** Variants read: same scope, through the parent product. */
export const variantReadAccess: Access = ({ req: { user } }) =>
  user && user.collection === 'users'
    ? true
    : { and: [{ _status: { equals: 'published' } }, { 'product.productType': { in: [...PUBLIC_PRODUCT_TYPES] } }] }
