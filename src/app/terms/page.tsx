export default function TermsPage() {
    return (
        <div className="container mx-auto p-8 text-white max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <div className="space-y-4 text-gray-300">
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <h2 className="text-xl font-semibold text-white mt-4">1. Introduction</h2>
                <p>
                    Welcome to Day Labor On Demand (DLOD). By accessing or using our app, you agree to be bound by these Terms of Service.
                </p>

                <h2 className="text-xl font-semibold text-white mt-4">2. Nature of Service</h2>
                <p>
                    DLOD acts solely as a platform to connect independent contractors ("Laborers") with entities seeking services ("Contractors").
                    DLOD is not an employer, employment agency, or labor broker.
                </p>

                <h2 className="text-xl font-semibold text-white mt-4">3. Independent Contractor Relationship</h2>
                <p>
                    Laborers are independent contractors, not employees of DLOD. Laborers are responsible for their own taxes, insurance, and tools unless otherwise agreed with the Contractor.
                    Contractors are responsible for verifying the eligibility of Laborers to work and for providing a safe work environment.
                </p>

                <h2 className="text-xl font-semibold text-white mt-4">4. No Liability for Accidents or Payments</h2>
                <p>
                    DLOD is not a party to any agreement between Laborers and Contractors.
                    DLOD is not responsible for:
                </p>
                <ul className="list-disc pl-6">
                    <li>Payment disputes between Laborers and Contractors.</li>
                    <li>Any accidents, injuries, or damages that occur at a job site.</li>
                    <li>The quality or completion of work performed.</li>
                </ul>

                <h2 className="text-xl font-semibold text-white mt-4">5. User Conduct</h2>
                <p>
                    Users agree to provide accurate information and to conduct themselves professionally.
                    Harassment, discrimination, or fraudulent activity will result in immediate account termination.
                </p>
            </div>
        </div>
    );
}
