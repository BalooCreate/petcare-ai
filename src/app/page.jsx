import {
  Heart,
  PawPrint,
  Calendar,
  MessageCircle,
  Camera,
  Shield,
  Users,
  Star,
} from "lucide-react";
import { Link, useNavigate } from "react-router"; 
import { useEffect } from "react";
import useUser from "../utils/useUser"; 

function LandingPage() {
  const { data: user, loading } = useUser();
  const navigate = useNavigate();

  // --- AM COMENTAT REDIRECȚIONAREA AUTOMATĂ ---
  // Astfel poți vedea Landing Page-ul chiar dacă ești "logat"
  /*
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  */

  const features = [
    {
      icon: <Calendar className="w-8 h-8 text-green-600" />,
      title: "Smart Scheduling",
      description:
        "Never miss feeding time, walks, or vet appointments with intelligent reminders",
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-blue-600" />,
      title: "AI Pet Assistant",
      description:
        "Get instant answers to pet care questions from our AI-powered chatbot",
    },
    {
      icon: <Camera className="w-8 h-8 text-purple-600" />,
      title: "Health Tracking",
      description:
        "Log symptoms, medications, and vet visits with photo documentation",
    },
    {
      icon: <Shield className="w-8 h-8 text-orange-600" />,
      title: "Secure & Private",
      description:
        "Your pet's data is encrypted and protected with enterprise-grade security",
    },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      text: "PetAssistent helped me keep track of my dog's medication schedule. Life-changing!",
      rating: 5,
    },
    {
      name: "Mike R.",
      text: "The AI chatbot answered my cat's behavior questions instantly. Amazing!",
      rating: 5,
    },
    {
      name: "Emma L.",
      text: "Finally, all my pet's health records in one place. So convenient!",
      rating: 5,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // --- AM ELIMINAT ACEASTĂ LINIE CARE FĂCEA ECRANUL ALB ---
  // if (user) return null; 

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-full">
                <PawPrint className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xl font-bold text-gray-800">
                PetAssistent
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Dacă ești logat, îți arătăm buton spre Dashboard, altfel Sign In */}
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/account/signin"
                    className="text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/account/signup"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <PawPrint className="w-12 h-12 text-green-600" />
            </div>
            <Heart className="w-8 h-8 text-pink-500" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Your Pet's
            <span className="text-green-600"> Smart Assistant</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Manage pet care routines, track health records, and get AI-powered
            advice to keep your furry friends happy and healthy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={user ? "/dashboard" : "/account/signup"}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              {user ? "Go to Dashboard" : "Start Free Trial"}
              <Heart className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg font-medium text-lg transition-colors"
            >
              Learn More
            </a>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>10,000+ Happy Pet Parents</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Everything Your Pet Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From daily care reminders to emergency health advice, PetAssistent
              has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Loved by Pet Parents
            </h2>
            <p className="text-xl text-gray-600">
              See what our community has to say about PetAssistent
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-500 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <p className="font-semibold text-gray-800">
                  {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Give Your Pet the Best Care?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of pet parents who trust PetAssistent for their pet's
            health and happiness.
          </p>
          <Link
            to="/account/signup"
            className="bg-white hover:bg-gray-100 text-green-600 px-8 py-4 rounded-lg font-medium text-lg transition-colors inline-flex items-center gap-2"
          >
            Start Your Free Trial
            <PawPrint className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="bg-green-100 p-2 rounded-full">
                <PawPrint className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xl font-bold">PetAssistent</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white">
                Contact
              </a>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2024 PetAssistent. All rights reserved. Built with ❤️ for
              pet lovers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;