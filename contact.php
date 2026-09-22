
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Kkopi.tea | Contact</title>

    <link rel="stylesheet" href="css/contact.css">

    <link href="https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;500;600;700;800&family=Baloo+Thambi&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>

<body>

<header>

    <h1>
        <span class="KKOPI">KKOPI</span>
        <span class="TEA">.TEA</span>
    </h1>

    <nav>
        <a href="home.php">Home</a>
        <a href="about.php">About</a>
        <a href="branches.php">Branch</a>
        <a href="contact.php">
            <span class="contact">Contact</span>
        </a>
    </nav>

    <button class="admin-login">ADMIN LOGIN</button>

</header>


<!-- HERO SECTION -->

<section class="contact-hero">

    <div class="hero-content">

        <h2>
            <span>GET IN </span><span class="orange-text">TOUCH</span>
        </h2>

        <p>
            We'd love to hear from you! Send us a message, visit our
            <br class="desktop-break">
            branches, or reach out through our social media.
        </p>

    </div>

    <div class="hero-image">

        <img src="Images/login.png" alt="KKOPI.TEA Drinks">

    </div>

</section>


<!-- MAIN CONTENT -->

<main class="contact-container">


    <!-- LEFT COLUMN -->

    <div class="left-column">


        <!-- CONTACT INFORMATION -->

        <section class="contact-information">

            <h2>Contact Information</h2>

            <div class="section-line"></div>

            <div class="information-layout">

                <div class="information-list">

                    <div class="information-item">

                        <div class="icon-circle">
                            <i class="fa-solid fa-location-dot"></i>
                        </div>

                        <div>
                            <strong>Main Office</strong>
                            <p>Manaoag, Pangasinan</p>
                        </div>

                    </div>


                    <div class="information-item">

                        <div class="icon-circle">
                            <i class="fa-solid fa-phone"></i>
                        </div>

                        <div>
                            <p>0948 394 4854</p>
                           
                        </div>

                    </div>


                    <div class="information-item">

                        <div class="icon-circle">
                            <i class="fa-solid fa-envelope"></i>
                        </div>

                        <div>
                            <p>kapatidsfoodhub@gmail.com</p>
                        </div>

                    </div>


                    <div class="information-item">

                        <div class="icon-circle">
                            <i class="fa-regular fa-clock"></i>
                        </div>

                        <div>
                            <p>7:00 AM - 9:00 PM</p>
                        </div>

                    </div>

                </div>


                <div class="contact-message">

                    <h3>
                        Great conversations<br>
                        start with good drinks.
                    </h3>

                    <p>
                        Whether you have a question,<br>
                        feedback, or a collaboration in mind,<br>
                        we're always happy to hear from you!
                    </p>

                </div>

            </div>

        </section>


        <!-- MAP -->

        <section class="map-section">

            <h2>Find Us on the Map</h2>

            <div class="section-line"></div>

            <img src="Images/maps-google.jpg" alt="KKOPI.TEA Location Map">

        </section>

    </div>


    <!-- RIGHT COLUMN -->

    <section class="message-section">

        <h2>Send us a Message</h2>

        <div class="section-line"></div>

        <form id="contactForm">

            <div class="form-row">

                <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    required
                >

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                >

            </div>


            <select name="subject" required>

                <option value="" disabled selected>
                    Subject
                </option>

                <option value="General Inquiry">
                    General Inquiry
                </option>

                <option value="Feedback">
                    Feedback
                </option>

                <option value="Collaboration">
                    Collaboration
                </option>

                <option value="Other">
                    Other
                </option>

            </select>


            <textarea
                name="message"
                placeholder="Your Message"
                required
            ></textarea>


            <button type="submit" class="send-button">

                <span>Send Message</span>

                <i class="fa-solid fa-arrow-right"></i>

            </button>

        </form>

    </section>

</main>


<!-- FOOTER -->

<footer>
        <p>&copy; 2024 Kkopi.tea. All rights reserved.</p>
    </footer>

<script src="script.js"></script>

</body>
</html>