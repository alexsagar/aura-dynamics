import type { Access, FieldAccess } from 'payload'

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
