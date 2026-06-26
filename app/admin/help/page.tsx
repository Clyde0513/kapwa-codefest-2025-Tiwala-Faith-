import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#7A0000] to-[#A01010] shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-white/80">
                <Link href="/admin" className="hover:text-white">Admin</Link>
                <span>›</span>
                <span className="text-white">Help & Support</span>
              </nav>
              <h1 className="text-2xl font-bold text-white mt-2">Help & Support</h1>
              <p className="text-white/90 mt-1">Learn how to manage your church&apos;s website</p>
            </div>
            <Link
              href="/admin"
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/20"
            >
              Back to Admin
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Getting Started */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">🚀 Getting Started</h2>
              <p className="text-gray-600 mt-1">New to managing your church website? Start here!</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">First Steps</h3>
                  <ol className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</span>
                      <div>
                        <strong>Update your church information:</strong> Go to Website Settings and fill in your church name, contact details, and service times.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</span>
                      <div>
                        <strong>Create your first post:</strong> Share news, announcements, or updates with your congregation.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">3</span>
                      <div>
                        <strong>Add upcoming events:</strong> Let people know about services, meetings, and special occasions.
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* How-To Guides */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">📚 How-To Guides</h2>
              <p className="text-gray-600 mt-1">Step-by-step instructions for common tasks</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Creating a Post</h3>
                    <p className="text-sm text-gray-600 mb-3">Share news and updates with your congregation</p>
                    <ol className="text-sm text-gray-700 space-y-1">
                      <li>1. Click &quot;New Post&quot; on the admin dashboard</li>
                      <li>2. Write a clear, descriptive title</li>
                      <li>3. Add your content in simple, clear language</li>
                      <li>4. Upload a photo if you have one</li>
                      <li>5. Click &quot;Create Post&quot; to publish</li>
                    </ol>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Adding an Event</h3>
                    <p className="text-sm text-gray-600 mb-3">Create events that appear on your website calendar</p>
                    <ol className="text-sm text-gray-700 space-y-1">
                      <li>1. Go to &quot;New Event&quot; from the dashboard</li>
                      <li>2. Enter the event title and description</li>
                      <li>3. Set the date and time</li>
                      <li>4. Add the location</li>
                      <li>5. Save to create the event</li>
                    </ol>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Uploading Photos</h3>
                    <p className="text-sm text-gray-600 mb-3">Add images to make your content more engaging</p>
                    <ol className="text-sm text-gray-700 space-y-1">
                      <li>1. Click &quot;Choose File&quot; in the photo upload area</li>
                      <li>2. Select a photo from your computer</li>
                      <li>3. Wait for the upload to complete</li>
                      <li>4. The photo will be automatically optimized</li>
                      <li>5. Use it in posts or add to your gallery</li>
                    </ol>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Updating Website Info</h3>
                    <p className="text-sm text-gray-600 mb-3">Keep your church information current</p>
                    <ol className="text-sm text-gray-700 space-y-1">
                      <li>1. Go to &quot;Website Settings&quot;</li>
                      <li>2. Update contact information</li>
                      <li>3. Change service times if needed</li>
                      <li>4. Update your mission statement</li>
                      <li>5. Save changes to update the website</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">✨ Best Practices</h2>
              <p className="text-gray-600 mt-1">Guidance for using your website effectively</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Writing Great Content</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Use clear, simple language that everyone can understand
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Include specific details like dates, times, and locations
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Add photos to make posts more engaging
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Keep paragraphs short and easy to read
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Proofread before publishing
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Managing Events</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Create events well in advance
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Include clear start and end times
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Add detailed location information
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Describe what people can expect
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Include contact information for questions
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">🔧 Troubleshooting</h2>
              <p className="text-gray-600 mt-1">Common issues and how to solve them</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Photo won&apos;t upload?</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Make sure the photo is less than 10MB in size</li>
                    <li>• Try using JPG or PNG format</li>
                    <li>• Check your internet connection</li>
                    <li>• Refresh the page and try again</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Changes not showing on website?</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Make sure you clicked &quot;Save&quot; after making changes</li>
                    <li>• Wait a few minutes for changes to appear</li>
                    <li>• Try refreshing your website page</li>
                    <li>• Check if you&apos;re looking at the right page</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Can&apos;t find a post or event?</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Check if it was saved as a draft</li>
                    <li>• Look in the &quot;Recent Posts&quot; or &quot;Upcoming Events&quot; sections</li>
                    <li>• Use the search function if available</li>
                    <li>• Make sure you&apos;re logged in to the admin panel</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          {/* <div className="bg-blue-50 rounded-lg border border-blue-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">📞 Need More Help?</h2>
              <p className="text-blue-800 mb-4">
                If you&apos;re still having trouble or need assistance with something not covered here, don&apos;t hesitate to reach out!
              </p>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Email:</strong> support@churchwebsite.com</p>
                <p><strong>Phone:</strong> (555) 123-4567</p>
                <p><strong>Hours:</strong> Monday-Friday, 9 AM - 5 PM</p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
