import { permanentRedirect } from 'next/navigation'

export default function TermsRedirectPage() {
  permanentRedirect('/policies/terms-and-conditions')
}
