<!DOCTYPE html>
<html lang="en">

<body>

  <h1>🏠 AI BNB — <em>Describe your trip. We’ll handle the rest.</em></h1>

  <blockquote>
    <p><strong>AI BNB</strong> reimagines Airbnb as if it were founded in 2025 — powered entirely by AI.<br>
    A chat-first platform where travelers describe their ideal trip, and AI plans, finds, and books the perfect stay — while hosts can generate listings from just a few photos.</p>
  </blockquote>

  <h2>🌍 Demo</h2>
  <ul>
    <li>🎥 <a href="https://www.loom.com/share/7774de8b71d145168dd4966642b1ef6a">Loom Demo Video →</a></li>
    <li>🧠 Built at <strong>Hack Princeton 2025</strong></li>
  </ul>

  <h2>📸 Screenshots</h2>
  <div class="center screenshots">
    <table>
      <tr>
        <th>Chat Interface</th>
        <th>AI-Generated Listing</th>
        <th>Host Flow</th>
      </tr>
      <tr>
        <td><img width="1470" height="829" alt="main" src="https://github.com/user-attachments/assets/10ec85b6-f85b-4f5b-8f8e-1abcbfb39a98" />
</td>
        <td><img width="1470" height="833" alt="listing" src="https://github.com/user-attachments/assets/39fa0bf9-49d6-40e6-9898-d3d4cd0941fd" />
</td>
        <td><img width="1470" height="829" alt="trip" src="https://github.com/user-attachments/assets/cdd45a20-10b7-44b2-b013-b8b1777208a8" />
</td>
      </tr>
    </table>
  </div>

  <h2>💡 Inspiration</h2>
  <p>As travelers, our group loathes the planning process that comes with long trips — from endlessly browsing Airbnbs to manually piecing together an itinerary.</p>
  <p>We also sympathize with home renters, who spend hours uploading images, writing descriptions, and managing bookings. So we built <strong>AI BNB</strong> — an all-in-one AI utility that makes life easier for both travelers and hosts.</p>

  <h2>🤖 What It Does</h2>
  <h3>🧳 For Travelers</h3>
  <ul>
    <li>Chat with an AI agent about destinations, group size, budget, and activities.</li>
    <li>Receive personalized property and itinerary suggestions.</li>
    <li>Collaborate with friends to co-plan and vote on trip ideas.</li>
  </ul>
  <h3>🏠 For Hosts</h3>
  <ul>
    <li>Upload photos, and the AI generates the full listing (title, description, amenities, price).</li>
    <li>Preview and publish instantly to Supabase.</li>
  </ul>

  <h2>🏗️ How We Built It</h2>
  <table>
    <tr><th>Layer</th><th>Technology</th></tr>
    <tr><td>Frontend</td><td>React + Next.js + Tailwind CSS</td></tr>
    <tr><td>Backend</td><td>Flask (Python) + Dedalus Labs Agents</td></tr>
    <tr><td>Database & Auth</td><td>Supabase (PostgreSQL + Auth + Storage)</td></tr>
    <tr><td>AI & Tools</td><td>OpenAI GPT-4o + Dedalus MCP servers</td></tr>
    <tr><td>Containerization</td><td>Docker</td></tr>
  </table>

  <h2>🧠 Architecture Overview</h2>
  <pre><code>Frontend (Next.js + Tailwind)
│
├── /api/query-agent → Flask Backend
│
Backend (Flask + Dedalus)
├── Tools:
│     ├── extract_trip_info
│     ├── clarify_missing_info
│     ├── find_stays
│     ├── book_stay
│     └── create_listing
│
Database (Supabase)
├── users
├── listings
├── bookings
└── experiences
</code></pre>

  <h2>⚔️ Challenges We Faced</h2>
  <p>We’re a team of only <strong>two hackers</strong>, and building a full-stack AI product in 36 hours wasn’t easy:</p>
  <ul>
    <li>Debugging dependency conflicts between Python and JS frameworks</li>
    <li>Learning and implementing agentic AI workflows</li>
    <li>Integrating Flask, Supabase, and Next.js seamlessly</li>
    <li>Balancing design, backend logic, and AI orchestration between two people</li>
  </ul>

  <h2>🏅 Accomplishments We’re Proud Of</h2>
  <ul>
    <li>Built a fully functional AI travel agent that books realistic stays</li>
    <li>Designed a host-side AI generator that turns raw photos into listings</li>
    <li>Created a chat-first UX that feels human and futuristic</li>
    <li>Learned and implemented Dedalus Labs tools for orchestration</li>
    <li>Delivered it all in under 36 hours 🚀</li>
  </ul>

  <h2>🧩 What We Learned</h2>
  <ul>
    <li>How to design for AI-first UX instead of traditional search</li>
    <li>How to manage multi-step reasoning with agentic AI</li>
    <li>That collaboration and asking for help are key to big projects</li>
    <li>That AI can simplify one of the most painful workflows — trip planning</li>
  </ul>

  <h2>🚀 What’s Next</h2>
  <ul>
    <li>📱 Mobile app for iOS and Android</li>
    <li>🧭 Live itinerary updates based on weather or flight changes</li>
    <li>🧩 More integrations (Booking.com, TripAdvisor, Google Places)</li>
    <li>💳 Stripe payments for real bookings</li>
  </ul>

  <blockquote>Our mission is simple: <strong>Turn the pain of planning into the joy of anticipation.</strong></blockquote>

  <h2>🧑‍💻 Run Locally</h2>
  <pre><code># Clone repo
git clone https://github.com/&lt;yoge1212&gt;/ai-bnb.git
cd ai-bnb

#set env var

#docker-compose up
</code></pre>

  <h2>🧰 Tech Stack</h2>
  <div class="center">
    <img class="badge" src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img class="badge" src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
    <img class="badge" src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img class="badge" src="https://img.shields.io/badge/Python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54" alt="Python" />
    <img class="badge" src="https://img.shields.io/badge/Flask-black?style=for-the-badge&logo=flask" alt="Flask" />
    <img class="badge" src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai" alt="OpenAI" />
    <img class="badge" src="https://img.shields.io/badge/Dedalus_Labs-blue?style=for-the-badge" alt="Dedalus Labs" />
  </div>

  <h2>👥 Team</h2>
  <table>
    <tr><th>Name</th></tr>
    <tr><td><strong>Yogesh Sampathkumar</strong></td></tr>
    <tr><td><strong>Jessie Singh</strong></td>/tr>
  </table>

  <h2>❤️ Acknowledgements</h2>
  <p>Special thanks to <strong>Dedalus Labs</strong>, and our mentors.</p>

</body>
</html>
