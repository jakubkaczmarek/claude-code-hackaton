"""
Selenium tests for Real Estate Board — covers all scenarios from Scenarios.md
Prerequisites:
    pip install selenium
    ChromeDriver matching your Chrome version must be on PATH
    Backend running on http://localhost:3000  (run.bat or: cd src/backend && node server.js)
"""

import time
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

BASE_URL = "http://localhost:3000"
WAIT_TIMEOUT = 10


def wait_for(driver, by, selector, timeout=WAIT_TIMEOUT):
    return WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((by, selector))
    )


def wait_for_visible(driver, by, selector, timeout=WAIT_TIMEOUT):
    return WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located((by, selector))
    )


class RealEstateBoardTests(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        options = Options()
        # options.add_argument("--headless")  # uncomment to run headless
        options.add_argument("--window-size=1280,900")
        cls.driver = webdriver.Chrome(options=options)
        cls.driver.implicitly_wait(5)

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    def setUp(self):
        # Clear localStorage between tests to reset favorites
        self.driver.get(BASE_URL)
        self.driver.execute_script("localStorage.clear();")
        self.driver.get(BASE_URL + "/#/properties")
        time.sleep(1)

    # ------------------------------------------------------------------
    # TS-01: Listing Page — Load All Properties
    # ------------------------------------------------------------------
    def test_ts01_all_properties_displayed(self):
        driver = self.driver
        cards = WebDriverWait(driver, WAIT_TIMEOUT).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".property-card"))
        )
        self.assertEqual(len(cards), 12, "Expected 12 property cards")

        count_text = driver.find_element(By.CSS_SELECTOR, ".listing-page__count").text
        self.assertIn("12", count_text)

    # ------------------------------------------------------------------
    # TS-02: Filtering — By Type
    # ------------------------------------------------------------------
    def test_ts02_filter_by_type(self):
        driver = self.driver
        wait_for(driver, By.CSS_SELECTOR, ".filter-panel")

        type_select = Select(driver.find_element(By.XPATH,
            "//filter-panel//select[.//option[text()='House']]"))
        type_select.select_by_value("house")
        time.sleep(1)

        cards = driver.find_elements(By.CSS_SELECTOR, ".property-card")
        self.assertGreater(len(cards), 0, "Expected at least one house")

        # No full page reload — URL still contains #/properties
        self.assertIn("#/properties", driver.current_url)

    # ------------------------------------------------------------------
    # TS-03: Filtering — By Status
    # ------------------------------------------------------------------
    def test_ts03_filter_by_status(self):
        driver = self.driver
        wait_for(driver, By.CSS_SELECTOR, ".filter-panel")

        status_select = Select(driver.find_element(By.XPATH,
            "//filter-panel//select[.//option[text()='For Rent']]"))
        status_select.select_by_value("for-rent")
        time.sleep(1)

        cards = driver.find_elements(By.CSS_SELECTOR, ".property-card")
        self.assertGreater(len(cards), 0, "Expected at least one for-rent property")

    # ------------------------------------------------------------------
    # TS-04: Filtering — By Location
    # ------------------------------------------------------------------
    def test_ts04_filter_by_location(self):
        driver = self.driver
        wait_for(driver, By.CSS_SELECTOR, ".filter-panel")

        location_select = Select(driver.find_element(By.XPATH,
            "//filter-panel//select[.//option[@ng-repeat]]"))
        options = [o for o in location_select.options if o.get_attribute("value")]
        self.assertGreater(len(options), 0, "No location options found")

        first_location = options[0].get_attribute("value")
        location_select.select_by_value(first_location)
        time.sleep(1)

        cards = driver.find_elements(By.CSS_SELECTOR, ".property-card")
        self.assertGreater(len(cards), 0, "Expected at least one property for this location")

    # ------------------------------------------------------------------
    # TS-05: Filtering — By Bedrooms Minimum
    # ------------------------------------------------------------------
    def test_ts05_filter_by_min_bedrooms(self):
        driver = self.driver
        wait_for(driver, By.CSS_SELECTOR, ".filter-panel")

        bed_select = Select(driver.find_element(By.XPATH,
            "//filter-panel//select[.//option[contains(text(),'bed') or contains(text(),'Any')]][last()]"))
        bed_select.select_by_visible_text("3+")
        time.sleep(1)

        cards = driver.find_elements(By.CSS_SELECTOR, ".property-card")
        self.assertGreater(len(cards), 0, "Expected properties with 3+ bedrooms")

    # ------------------------------------------------------------------
    # TS-06: Filtering — By Price Range
    # ------------------------------------------------------------------
    def test_ts06_filter_by_price_range(self):
        driver = self.driver
        wait_for(driver, By.CSS_SELECTOR, ".filter-panel")

        min_input = driver.find_element(By.XPATH,
            "//filter-panel//input[@ng-model='filters.priceMin']")
        max_input = driver.find_element(By.XPATH,
            "//filter-panel//input[@ng-model='filters.priceMax']")

        min_input.clear()
        min_input.send_keys("200000")
        min_input.send_keys(Keys.TAB)
        max_input.clear()
        max_input.send_keys("800000")
        max_input.send_keys(Keys.TAB)
        time.sleep(1)

        cards = driver.find_elements(By.CSS_SELECTOR, ".property-card")
        self.assertGreater(len(cards), 0, "Expected properties in price range 200k–800k")

    # ------------------------------------------------------------------
    # TS-07: Filtering — Keyword Search
    # ------------------------------------------------------------------
    def test_ts07_filter_by_keyword(self):
        driver = self.driver
        wait_for(driver, By.CSS_SELECTOR, ".filter-panel")

        keyword_input = driver.find_element(By.XPATH,
            "//filter-panel//input[@ng-model='filters.keyword']")
        keyword_input.clear()
        keyword_input.send_keys("house")
        keyword_input.send_keys(Keys.TAB)
        time.sleep(1)

        cards = driver.find_elements(By.CSS_SELECTOR, ".property-card")
        self.assertGreater(len(cards), 0, "Expected results for keyword 'house'")

    # ------------------------------------------------------------------
    # TS-08: Filtering — Empty State
    # ------------------------------------------------------------------
    def test_ts08_empty_state_when_no_results(self):
        driver = self.driver
        wait_for(driver, By.CSS_SELECTOR, ".filter-panel")

        keyword_input = driver.find_element(By.XPATH,
            "//filter-panel//input[@ng-model='filters.keyword']")
        keyword_input.clear()
        keyword_input.send_keys("xyznonexistentproperty12345")
        keyword_input.send_keys(Keys.TAB)
        time.sleep(1)

        empty = wait_for_visible(driver, By.CSS_SELECTOR, ".listing-page__empty")
        self.assertIn("No properties", empty.text)

        cta = empty.find_element(By.TAG_NAME, "a")
        self.assertTrue(cta.is_displayed())

    # ------------------------------------------------------------------
    # TS-09: Filtering — Clear Filters
    # ------------------------------------------------------------------
    def test_ts09_clear_filters(self):
        driver = self.driver
        wait_for(driver, By.CSS_SELECTOR, ".filter-panel")

        type_select = Select(driver.find_element(By.XPATH,
            "//filter-panel//select[.//option[text()='House']]"))
        type_select.select_by_value("house")
        time.sleep(0.5)

        clear_btn = driver.find_element(By.CSS_SELECTOR, ".filter-panel__clear-btn")
        clear_btn.click()
        time.sleep(1)

        cards = driver.find_elements(By.CSS_SELECTOR, ".property-card")
        self.assertEqual(len(cards), 12, "Expected all 12 properties after clearing filters")

    # ------------------------------------------------------------------
    # TS-10: Sorting
    # ------------------------------------------------------------------
    def test_ts10_sorting(self):
        driver = self.driver
        wait_for(driver, By.CSS_SELECTOR, ".listing-page__sort")

        sort_select = Select(driver.find_element(By.CSS_SELECTOR, ".listing-page__sort select"))

        # Price Low -> High
        sort_select.select_by_value("price-asc")
        time.sleep(0.5)
        prices_asc = [e.text for e in driver.find_elements(By.CSS_SELECTOR, ".property-card__price")]
        self.assertGreater(len(prices_asc), 0)

        # Price High -> Low
        sort_select.select_by_value("price-desc")
        time.sleep(0.5)
        prices_desc = [e.text for e in driver.find_elements(By.CSS_SELECTOR, ".property-card__price")]
        self.assertEqual(prices_asc, list(reversed(prices_desc)))

        # Newest
        sort_select.select_by_value("newest")
        time.sleep(0.5)
        cards_newest = driver.find_elements(By.CSS_SELECTOR, ".property-card")
        self.assertGreater(len(cards_newest), 0)

        # Most Bedrooms
        sort_select.select_by_value("bedrooms-desc")
        time.sleep(0.5)
        cards_beds = driver.find_elements(By.CSS_SELECTOR, ".property-card")
        self.assertGreater(len(cards_beds), 0)

    # ------------------------------------------------------------------
    # TS-11: Property Card Display
    # ------------------------------------------------------------------
    def test_ts11_property_card_elements(self):
        driver = self.driver
        wait_for(driver, By.CSS_SELECTOR, ".property-card")

        card = driver.find_elements(By.CSS_SELECTOR, ".property-card")[0]
        self.assertTrue(card.find_element(By.CSS_SELECTOR, ".property-card__image").is_displayed())
        self.assertTrue(card.find_element(By.CSS_SELECTOR, ".property-card__price").is_displayed())
        self.assertTrue(card.find_element(By.CSS_SELECTOR, ".property-card__title").is_displayed())
        self.assertTrue(card.find_element(By.CSS_SELECTOR, ".property-card__address").is_displayed())
        self.assertTrue(card.find_element(By.CSS_SELECTOR, ".property-card__fav-btn").is_displayed())
        self.assertTrue(card.find_element(By.CSS_SELECTOR, ".property-card__link").is_displayed())
        self.assertTrue(card.find_element(By.CSS_SELECTOR, "status-badge").is_displayed())

    # ------------------------------------------------------------------
    # TS-12: Navigation to Detail Page
    # ------------------------------------------------------------------
    def test_ts12_navigate_to_detail_page(self):
        driver = self.driver
        wait_for(driver, By.CSS_SELECTOR, ".property-card")

        link = driver.find_element(By.CSS_SELECTOR, ".property-card__link")
        link.click()
        time.sleep(1)

        self.assertIn("#/properties/", driver.current_url)

        wait_for_visible(driver, By.CSS_SELECTOR, ".detail-header__title")
        self.assertTrue(driver.find_element(By.CSS_SELECTOR, ".detail-header__title").is_displayed())
        self.assertTrue(driver.find_element(By.CSS_SELECTOR, ".detail-header__price").is_displayed())
        self.assertTrue(driver.find_element(By.CSS_SELECTOR, ".detail-description").is_displayed())
        self.assertTrue(driver.find_element(By.CSS_SELECTOR, ".agent-card").is_displayed())

    # ------------------------------------------------------------------
    # TS-13: Image Gallery — Thumbnail Click
    # ------------------------------------------------------------------
    def test_ts13_image_gallery_thumbnail_click(self):
        driver = self.driver
        # Navigate to first property with multiple images
        driver.get(BASE_URL + "/#/properties")
        wait_for(driver, By.CSS_SELECTOR, ".property-card__link")
        driver.find_element(By.CSS_SELECTOR, ".property-card__link").click()
        time.sleep(1)

        wait_for_visible(driver, By.CSS_SELECTOR, ".detail-gallery__main-img")
        thumbs = driver.find_elements(By.CSS_SELECTOR, ".detail-gallery__thumb")

        if len(thumbs) > 1:
            initial_src = driver.find_element(By.CSS_SELECTOR, ".detail-gallery__main-img").get_attribute("src")
            thumbs[1].click()
            time.sleep(0.5)
            new_src = driver.find_element(By.CSS_SELECTOR, ".detail-gallery__main-img").get_attribute("src")
            self.assertNotEqual(initial_src, new_src, "Main image should change on thumbnail click")
        else:
            self.skipTest("Property has only one image; cannot test thumbnail switching")

    # ------------------------------------------------------------------
    # TS-14: Contact Form — Validation
    # ------------------------------------------------------------------
    def test_ts14_contact_form_validation(self):
        driver = self.driver
        driver.get(BASE_URL + "/#/properties")
        wait_for(driver, By.CSS_SELECTOR, ".property-card__link")
        driver.find_element(By.CSS_SELECTOR, ".property-card__link").click()
        time.sleep(1)

        wait_for_visible(driver, By.CSS_SELECTOR, ".contact-form__submit")
        submit_btn = driver.find_element(By.CSS_SELECTOR, ".contact-form__submit")
        submit_btn.click()
        time.sleep(0.5)

        errors = driver.find_elements(By.CSS_SELECTOR, ".contact-form__error")
        visible_errors = [e for e in errors if e.is_displayed()]
        self.assertGreater(len(visible_errors), 0, "Expected validation errors on empty submit")

    # ------------------------------------------------------------------
    # TS-15: Contact Form — Successful Submit
    # ------------------------------------------------------------------
    def test_ts15_contact_form_success(self):
        driver = self.driver
        driver.get(BASE_URL + "/#/properties")
        wait_for(driver, By.CSS_SELECTOR, ".property-card__link")
        driver.find_element(By.CSS_SELECTOR, ".property-card__link").click()
        time.sleep(1)

        wait_for_visible(driver, By.CSS_SELECTOR, "form[name='contactForm']")

        driver.find_element(By.XPATH, "//input[@name='name']").send_keys("Test User")
        driver.find_element(By.XPATH, "//input[@name='email']").send_keys("test@example.com")
        driver.find_element(By.XPATH, "//textarea[@name='message']").send_keys("I am interested in this property.")

        driver.find_element(By.CSS_SELECTOR, ".contact-form__submit").click()
        time.sleep(0.5)

        success = wait_for_visible(driver, By.CSS_SELECTOR, ".contact-form__success")
        self.assertTrue(success.is_displayed(), "Success banner should be visible after valid submit")

        form = driver.find_elements(By.XPATH, "//form[@name='contactForm']")
        self.assertTrue(len(form) == 0 or not form[0].is_displayed(),
                        "Form should be hidden after successful submit")

    # ------------------------------------------------------------------
    # TS-16: Favorites — Add Property
    # ------------------------------------------------------------------
    def test_ts16_add_to_favorites(self):
        driver = self.driver
        wait_for(driver, By.CSS_SELECTOR, ".property-card")

        fav_btn = driver.find_element(By.CSS_SELECTOR, ".property-card__fav-btn")
        fav_btn.click()
        time.sleep(0.5)

        badge = wait_for_visible(driver, By.CSS_SELECTOR, ".navbar__fav-badge")
        self.assertEqual(badge.text, "1", "Badge should show count of 1")

    # ------------------------------------------------------------------
    # TS-17: Favorites — Persistence After Refresh
    # ------------------------------------------------------------------
    def test_ts17_favorites_persist_after_refresh(self):
        driver = self.driver
        wait_for(driver, By.CSS_SELECTOR, ".property-card")

        driver.find_element(By.CSS_SELECTOR, ".property-card__fav-btn").click()
        time.sleep(0.5)

        driver.refresh()
        time.sleep(1)

        badge = wait_for_visible(driver, By.CSS_SELECTOR, ".navbar__fav-badge")
        self.assertEqual(badge.text, "1", "Favorites badge should persist after page refresh")

    # ------------------------------------------------------------------
    # TS-18: Favorites Page — Populated
    # ------------------------------------------------------------------
    def test_ts18_favorites_page_populated(self):
        driver = self.driver
        wait_for(driver, By.CSS_SELECTOR, ".property-card")

        driver.find_element(By.CSS_SELECTOR, ".property-card__fav-btn").click()
        time.sleep(0.5)

        driver.find_element(By.CSS_SELECTOR, "a[href='#/favorites']").click()
        time.sleep(1)

        cards = wait_for(driver, By.CSS_SELECTOR, ".property-card")
        all_cards = driver.find_elements(By.CSS_SELECTOR, ".property-card")
        self.assertGreater(len(all_cards), 0, "Favorites page should show saved properties")

        count_text = driver.find_element(By.CSS_SELECTOR, ".favorites-page__count").text
        self.assertIn("1", count_text)

    # ------------------------------------------------------------------
    # TS-19: Favorites Page — Empty State
    # ------------------------------------------------------------------
    def test_ts19_favorites_empty_state(self):
        driver = self.driver
        driver.find_element(By.CSS_SELECTOR, "a[href='#/favorites']").click()
        time.sleep(1)

        empty = wait_for_visible(driver, By.CSS_SELECTOR, ".favorites-page__empty")
        self.assertTrue(empty.is_displayed(), "Empty state should be visible when no favorites")

        cta = empty.find_element(By.CSS_SELECTOR, ".favorites-page__cta")
        self.assertTrue(cta.is_displayed())
        self.assertIn("#/properties", cta.get_attribute("href"))

    # ------------------------------------------------------------------
    # TS-20: Favorites — Remove Property
    # ------------------------------------------------------------------
    def test_ts20_remove_from_favorites(self):
        driver = self.driver
        wait_for(driver, By.CSS_SELECTOR, ".property-card")

        # Add to favorites
        driver.find_element(By.CSS_SELECTOR, ".property-card__fav-btn").click()
        time.sleep(0.5)
        badge = wait_for_visible(driver, By.CSS_SELECTOR, ".navbar__fav-badge")
        self.assertEqual(badge.text, "1")

        # Remove from favorites
        driver.find_element(By.CSS_SELECTOR, ".property-card__fav-btn").click()
        time.sleep(0.5)

        badges = driver.find_elements(By.CSS_SELECTOR, ".navbar__fav-badge")
        hidden = len(badges) == 0 or not badges[0].is_displayed()
        self.assertTrue(hidden, "Badge should disappear after removing the only favorite")

    # ------------------------------------------------------------------
    # TS-21: Related Properties on Detail Page
    # ------------------------------------------------------------------
    def test_ts21_related_properties(self):
        driver = self.driver
        wait_for(driver, By.CSS_SELECTOR, ".property-card__link")
        first_link = driver.find_element(By.CSS_SELECTOR, ".property-card__link")
        first_link.click()
        time.sleep(1)

        related_section = driver.find_elements(By.CSS_SELECTOR, ".detail-related")
        if related_section and related_section[0].is_displayed():
            related_cards = related_section[0].find_elements(By.CSS_SELECTOR, ".property-card")
            self.assertLessEqual(len(related_cards), 3, "At most 3 related properties expected")
            self.assertGreater(len(related_cards), 0)
        else:
            self.skipTest("No related properties for this listing")

    # ------------------------------------------------------------------
    # TS-22: API — Properties Endpoint
    # ------------------------------------------------------------------
    def test_ts22_api_properties_endpoint(self):
        import urllib.request
        import json

        with urllib.request.urlopen(BASE_URL + "/api/properties") as response:
            self.assertEqual(response.status, 200)
            data = json.loads(response.read())
            self.assertIsInstance(data, list)
            self.assertEqual(len(data), 12, "API should return 12 properties")
            required_fields = {"id", "title", "type", "status", "price", "bedrooms", "agentId"}
            for prop in data:
                missing = required_fields - set(prop.keys())
                self.assertEqual(missing, set(), f"Property missing fields: {missing}")

    # ------------------------------------------------------------------
    # TS-23: API — Property Not Found
    # ------------------------------------------------------------------
    def test_ts23_api_property_not_found(self):
        import urllib.request
        import urllib.error

        try:
            urllib.request.urlopen(BASE_URL + "/api/properties/nonexistent-id-xyz")
            self.fail("Expected 404 but got 200")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 404, f"Expected 404, got {e.code}")

    # ------------------------------------------------------------------
    # TS-24: Routing — Default Redirect
    # ------------------------------------------------------------------
    def test_ts24_default_route_redirect(self):
        driver = self.driver
        driver.get(BASE_URL + "/#/unknown-route-xyz")
        time.sleep(1)

        self.assertIn("#/properties", driver.current_url,
                      "Unknown route should redirect to #/properties")

    # ------------------------------------------------------------------
    # TS-25: Responsive Layout — 375px Mobile
    # ------------------------------------------------------------------
    def test_ts25_responsive_mobile_layout(self):
        driver = self.driver
        driver.set_window_size(375, 812)
        driver.get(BASE_URL + "/#/properties")
        time.sleep(1)

        wait_for(driver, By.CSS_SELECTOR, ".property-card")
        cards = driver.find_elements(By.CSS_SELECTOR, ".property-card")
        self.assertGreater(len(cards), 0, "Cards should render on mobile viewport")

        # Verify cards stack in a single column: each card width ~ viewport width
        card = cards[0]
        card_width = card.size["width"]
        self.assertGreater(card_width, 300, "Card should fill most of the 375px viewport")

        # Reset to normal size
        driver.set_window_size(1280, 900)


if __name__ == "__main__":
    unittest.main(verbosity=2)
