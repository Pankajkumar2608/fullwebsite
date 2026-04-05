import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-24 w-full mt-20">
        <h1 className="text-4xl md:text-5xl font-black mb-8 text-[#fed802] tracking-tighter">Terms of Service</h1>
        <div className="prose prose-invert prose-yellow max-w-none">
          <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">1. Agreement to Terms</h2>
          <p className="text-gray-300 mb-6 font-medium">
            By viewing or using this website, which can be accessed at motivationkaksha.com, you are agreeing to be bound by 
            these website's Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable 
            local laws. If you disagree with any of these terms, you are prohibited from accessing this site.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">2. Use License</h2>
          <p className="text-gray-300 mb-6 font-medium">
            Permission is granted to temporarily download one copy of the materials on Motivation Kaksha's Website for personal, 
            non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 text-gray-300 mb-6 space-y-2 font-medium">
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose or for any public display;</li>
            <li>attempt to reverse engineer any software contained on Motivation Kaksha's Website;</li>
            <li>remove any copyright or other proprietary notations from the materials; or</li>
            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">3. Disclaimer</h2>
          <p className="text-gray-300 mb-6 font-medium">
            All the materials on Motivation Kaksha's Website are provided "as is". Motivation Kaksha makes no warranties, may it be 
            expressed or implied, therefore negates all other warranties. Furthermore, Motivation Kaksha does not make any representations 
            concerning the accuracy or reliability of the use of the materials on its Website or otherwise relating to such materials 
            or any sites linked to this Website.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">4. Limitations</h2>
          <p className="text-gray-300 mb-6 font-medium">
            Motivation Kaksha or its suppliers will not be hold accountable for any damages that will arise with the use or inability 
            to use the materials on Motivation Kaksha's Website, even if Motivation Kaksha or an authorize representative of this Website 
            has been notified, orally or written, of the possibility of such damage.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">5. Governing Law</h2>
          <p className="text-gray-300 mb-6 font-medium">
            Any claim related to Motivation Kaksha's Website shall be governed by the laws of India without regards to its conflict of law provisions.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">6. Contact Us</h2>
          <p className="text-gray-300 mb-6 font-medium">
            If you have any questions or suggestions about our Terms of Service, do not hesitate to contact us.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
