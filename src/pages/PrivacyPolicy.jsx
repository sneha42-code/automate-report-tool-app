import "../styles/footerLink.css";
const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <section>
        <h2 className="text-2xl font-semibold mb-2">1. Data Collection</h2>
        <p>We collect data you provide when interacting with our AI services, such as input queries, usage patterns, and preferences, to improve our models and personalize your experience.</p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-2">2. Data Use</h2>
        <p>Your data is used to train our AI models, provide tailored responses, and enhance service functionality. We do not share identifiable data with third parties except as required by law.</p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-2">3. Data Security</h2>
        <p>We implement industry-standard security measures to protect your data. However, no system is completely secure, and you use our services at your own risk.</p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;