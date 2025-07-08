import "../styles/FooterLink.css";
const CookiePolicy = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Cookie Policy</h1>
        <section>
        <h2 className="text-2xl font-semibold mb-2">1. What Are Cookies?</h2>
        <p>Cookies are small text files stored on your device to enhance your experience with our AI services, such as remembering your preferences and tracking usage patterns.</p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-2">2. How We Use Cookies</h2>
        <p>We use cookies to optimize AI service performance, analyze usage trends, and deliver personalized content. Some cookies are essential for service functionality.</p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-2">3. Managing Cookies</h2>
        <p>You can control cookies through your browser settings. Disabling cookies may limit some AI service features, such as personalized recommendations.</p>
      </section>
    </div>
  );
};

export default CookiePolicy;