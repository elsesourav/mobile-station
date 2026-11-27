import { permanentRedirect } from 'next/navigation'

export default function PrivacyPolicyRedirectPage() {
  permanentRedirect('/policies/privacy-policy')
}
