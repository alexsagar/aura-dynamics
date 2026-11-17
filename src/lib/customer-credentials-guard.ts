import { APIError, type CollectionBeforeChangeHook } from 'payload'
import { passwordProblem } from './account-settings'

/**
 * Email and password are credentials: over REST/GraphQL a customer may not
 * change them with a plain update (that would skip the current-password check
 * and email verification). Password changes go through the account settings
 * server action, which re-checks the current password and then uses the local
 * API. Admins (`users`) keep their normal Admin-panel abilities.
 * Also enforces the password rules on every non-local create/update.
 */
export const guardCustomerCredentials: CollectionBeforeChangeHook = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (req.payloadAPI === 'local') return data
  // Payload ignores an empty password (no change), so only a real value is checked.
  if (data.password) {
    const problem = passwordProblem(data.password)
    if (problem) throw new APIError(problem, 400, undefined, true)
  }
  if (operation === 'update' && req.user?.collection === 'customers') {
    if (data.password)
      throw new APIError('Change your password from Account settings.', 403, undefined, true)
    if (data.email !== undefined && data.email !== originalDoc?.email)
      throw new APIError('Email address changes are not supported.', 403, undefined, true)
  }
  return data
}
