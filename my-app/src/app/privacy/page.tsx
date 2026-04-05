import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-24 w-full mt-20">
        <h1 className="text-4xl md:text-5xl font-black mb-8 text-[#fed802] tracking-tighter">Privacy Policy</h1>
        <div className="prose prose-invert prose-yellow max-w-none">
          <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">1. Introduction</h2>
          <p className="text-gray-300 mb-6 font-medium">
            Welcome to Motivation Kaksha. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website 
            and tell you about your privacy rights.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">2. The Data We Collect About You</h2>
          <p className="text-gray-300 mb-6 font-medium">
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 text-gray-300 mb-6 space-y-2 font-medium">
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
            <li><strong>Profile Data:</strong> includes your rank, category, gender, and saved wishlists.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">3. How We Use Your Personal Data</h2>
          <p className="text-gray-300 mb-6 font-medium">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-gray-300 mb-6 space-y-2 font-medium">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">4. Google API Services User Data Policy</h2>
          <p className="text-gray-300 mb-6 font-medium">
            Motivation Kaksha's use and transfer to any other app of information received from Google APIs will adhere to 
            <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-[#fed802] hover:underline ml-1" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, 
            including the Limited Use requirements.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">5. Data Security</h2>
          <p className="text-gray-300 mb-6 font-medium">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">6. Contact Us</h2>
          <p className="text-gray-300 mb-6 font-medium">
            If you have any questions about this privacy policy or our privacy practices, please contact our support team.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
