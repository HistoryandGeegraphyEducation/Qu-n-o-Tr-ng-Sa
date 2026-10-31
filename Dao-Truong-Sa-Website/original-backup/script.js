
 // ==================================================
// KHÁM PHÁ QUẦN ĐẢO TRƯỜNG SA — SCRIPT.JS HOÀN CHỈNH
// DÙNG FILE ÂM THANH MP3
// ==================================================

// --------------------------
// DỮ LIỆU CÁC ĐẢO
// --------------------------
const islands = {
    "truong-sa-lon": {
        name: "ĐẢO TRƯỜNG SA LỚN",
        location: "Quần đảo Trường Sa, Khánh Hòa",
        coordinates: "10°23'N 114°17'E",
        area: "0,33 km²",
        images: [
            "images/truong-sa-lon-1.jpg",
            "images/truong-sa-lon-2.jpg",
            "images/truong-sa-lon-3.jpg"
        ],
        video: "videos/truong-sa-lon.mp4",
        terrain: [
            "Là đảo nổi hình thành trên nền san hô, bề mặt tương đối bằng phẳng.",
            "Đảo có nền đất chủ yếu là cát và vật liệu san hô, cao khoảng 2,5–3,5 m so với mực nước biển.",
            "Xung quanh đảo là thềm san hô và vùng biển nông, chịu tác động rõ rệt của sóng và thủy triều."
        ],
        climate: [
            "Mang đặc trưng khí hậu nhiệt đới hải dương, nền nhiệt cao quanh năm.",
            "Lượng mưa trung bình năm của khu vực Trường Sa khoảng trên 2.500 mm, tập trung chủ yếu vào mùa mưa."
        ],
        humanActivity: [
            "Cán bộ, chiến sĩ và người dân sinh sống, làm việc, học tập và thực hiện các hoạt động bảo đảm đời sống trên đảo.",
            "Trồng và chăm sóc cây xanh, sản xuất rau, đồng thời phát triển các công trình dân sinh, dịch vụ và hậu cần nghề cá."
        ]
    },

    "sinh-ton": {
        name: "ĐẢO SINH TỒN",
        location: "Quần đảo Trường Sa, Khánh Hòa",
        coordinates: "10°23'N 114°24'E",
        area: "0,08 km²",
        images: [
            "images/sinh-ton-1.jpg",
            "images/sinh-ton-2.jpg",
            "images/sinh-ton-3.jpg"
        ],
        video: "videos/sinh-ton.mp4",
        terrain: [
            "Đảo san hô thấp, hẹp, hình dạng hơi cong.",
            "Độ cao trung bình khoảng 2–3 m so với mực nước biển.",
            "Có bãi cát bao quanh, san hô phát triển tốt xung quanh đảo."
        ],
        climate: [
            "Khí hậu nhiệt đới hải dương, nhiệt độ trung bình 26–30°C.",
            "Mưa nhiều, ẩm cao, chịu ảnh hưởng bão từ tháng 5 đến tháng 11."
        ],
        humanActivity: [
            "Có người dân và lực lượng bảo vệ chủ quyền sinh sống.",
            "Phát triển nghề cá, trồng rau xanh phục vụ đời sống."
        ]
    },

    "song-tu-tay": {
        name: "ĐẢO SONG TỬ TÂY",
        location: "Quần đảo Trường Sa, Khánh Hòa",
        coordinates: "11°26'N 114°20'E",
        area: "0,24 km²",
        images: [
            "images/song-tu-tay-1.jpg",
            "images/song-tu-tay-2.jpg",
            "images/song-tu-tay-3.jpg"
        ],
        video: "videos/song-tu-tay.mp4",
        terrain: [
            "Đảo hình bầu dục, tương đối bằng phẳng.",
            "Cao khoảng 3–4 m trên mực nước biển.",
            "Có nguồn nước ngọt và thảm thực vật phong phú."
        ],
        climate: [
            "Khí hậu nhiệt đới hải dương, ôn hòa quanh năm.",
            "Lượng mưa trung bình khoảng 2.300 mm/năm."
        ],
        humanActivity: [
            "Ngư dân sinh sống lâu đời, phát triển đánh bắt hải sản.",
            "Có công trình hạ tầng, trường học, trạm y tế trên đảo."
        ]
    },

    "an-bang": {
        name: "ĐẢO AN BANG",
        location: "Quần đảo Trường Sa, Khánh Hòa",
        coordinates: "10°23'N 114°53'E",
        area: "0,15 km²",
        images: [
            "images/an-bang-1.jpg",
            "images/an-bang-2.jpg",
            "images/an-bang-3.jpg"
        ],
        video: "videos/an-bang.mp4",
        terrain: [
            "Đảo san hô nổi, hình dạng không đều.",
            "Cao khoảng 2–3 m, bề mặt cát trắng mịn.",
            "Bao quanh là rạn san hô rộng và đẹp."
        ],
        climate: [
            "Khí hậu nhiệt đới hải dương, nắng nhiều, gió biển mát mẻ.",
            "Mùa mưa từ tháng 5 đến tháng 11, mùa khô từ tháng 12 đến tháng 4."
        ],
        humanActivity: [
            "Lực lượng bảo vệ chủ quyền đóng quân và canh giữ đảo.",
            "Hoạt động nghiên cứu khoa học và bảo tồn đa dạng sinh học."
        ]
    }
};

// --------------------------
// FILE ÂM THANH MP3
// --------------------------
const islandAudio = {
    "truong-sa-lon": "audio/chao-truong-sa-lon.mp3",
    "sinh-ton": "audio/chao-sinh-ton.mp3",
    "song-tu-tay": "audio/chao-song-tu-tay.mp3",
    "an-bang": "audio/chao-an-bang.mp3"
};

// --------------------------
// PHÁT ÂM THANH
// --------------------------
let loiChaoAudio;

function playIslandAudio(audioUrl) {
    loiChaoAudio = document.getElementById("loi-chao-audio");

    if (!loiChaoAudio || !audioUrl) return;

    loiChaoAudio.pause();
    loiChaoAudio.src = audioUrl;
    loiChaoAudio.currentTime = 0;

    loiChaoAudio.play().catch(error => {
        console.log(
            "Trình duyệt có thể yêu cầu thao tác của người dùng trước khi phát âm thanh:",
            error
        );
    });
}

// --------------------------
// BIẾN TOÀN CỤC
// --------------------------
let currentIsland = "truong-sa-lon";
let currentImageIndex = 0;
let touchStartX = 0;
let touchEndX = 0;
let isShipSailing = false;

// --------------------------
// CÁC PHẦN TỬ HTML
// --------------------------
const galleryMainImage = document.getElementById("gallery-main-image");
const thumbnails = document.querySelectorAll(".gallery-thumbnail");
const islandButtons = document.querySelectorAll(".island-button");
const gallery = document.getElementById("island-gallery");
const heroSection = document.querySelector(".hero");
const shipContainer = document.getElementById("ship-container");

const islandName = document.getElementById("island-name");
const heroLocation = document.getElementById("hero-location");
const islandLocation = document.getElementById("island-location");
const islandCoordinates = document.getElementById("island-coordinates");
const islandArea = document.getElementById("island-area");

const islandTerrain = document.getElementById("island-terrain");
const islandClimate = document.getElementById("island-climate");
const islandHumanActivity = document.getElementById("island-human-activity");

const islandVideo = document.getElementById("island-video");
const basicInfoSection = document.querySelector(".basic-information");
const islandInfoSection = document.querySelector(".island-information");

// --------------------------
// MẶT TRỜI / MẶT TRĂNG THEO GIỜ
// --------------------------
function updateCelestialBody() {
    if (!heroSection) return;

    const now = new Date();
    const hours = now.getHours();
    const totalMinutes = hours * 60 + now.getMinutes();

    const isDay = totalMinutes >= 60 && totalMinutes <= 1079;

    if (isDay) {
        heroSection.classList.remove("night-mode");
    } else {
        heroSection.classList.add("night-mode");
    }
}

// --------------------------
// TÀU CHẠY NGANG KHI CHUYỂN ĐẢO
// --------------------------
function sailShip() {
    if (!shipContainer || isShipSailing) return;

    isShipSailing = true;

    shipContainer.classList.remove("sailing", "docked");

    // Khởi động lại hiệu ứng chuyển động
    void shipContainer.offsetWidth;

    shipContainer.classList.add("sailing");

    setTimeout(() => {
        shipContainer.classList.remove("sailing");
        shipContainer.classList.add("docked");
    }, 2500);

    setTimeout(() => {
        isShipSailing = false;
    }, 4000);
}

// --------------------------
// CẬP NHẬT DANH SÁCH THÔNG TIN
// --------------------------
function updateListContent(element, items) {
    if (!element) return;

    element.innerHTML = items.map(text => `
        <li>
            <span></span>
            <p>${text}</p>
        </li>
    `).join("");
}

// --------------------------
// CẬP NHẬT ẢNH TRONG THƯ VIỆN
// --------------------------
function updateGalleryImages(images) {
    if (!galleryMainImage || !images || images.length === 0) return;

    galleryMainImage.src = images[currentImageIndex];
    galleryMainImage.alt = islands[currentIsland].name;

    thumbnails.forEach((thumb, index) => {
        const thumbnailImage = thumb.querySelector("img");

        if (thumbnailImage && images[index]) {
            thumbnailImage.src = images[index];
        }

        if (images[index]) {
            thumb.dataset.image = images[index];
        }

        thumb.classList.toggle("active", index === currentImageIndex);
    });
}

// --------------------------
// CẬP NHẬT NỘI DUNG THEO ĐẢO
// --------------------------
function updateIslandContent(islandId) {
    const island = islands[islandId];

    if (!island) return;

    // Phát lời chào của đảo được chọn
    playIslandAudio(islandAudio[islandId]);

    // Chạy hiệu ứng tàu
    sailShip();

    if (basicInfoSection) {
        basicInfoSection.classList.add("content-switching");
    }

    if (islandInfoSection) {
        islandInfoSection.classList.add("content-switching");
    }

    setTimeout(() => {
        if (islandName) {
            islandName.textContent = island.name;
        }

        if (heroLocation) {
            heroLocation.textContent =
                `${island.location.split(",")[0]} · Việt Nam`;
        }

        if (islandLocation) {
            islandLocation.textContent = island.location;
        }

        if (islandCoordinates) {
            islandCoordinates.textContent = island.coordinates;
        }

        if (islandArea) {
            islandArea.textContent = island.area;
        }

        currentImageIndex = 0;
        updateGalleryImages(island.images);

        if (islandVideo) {
            const videoSource = islandVideo.querySelector("source");

            if (videoSource) {
                videoSource.src = island.video;
            }

            islandVideo.poster = island.images[0];
            islandVideo.load();
        }

        updateListContent(islandTerrain, island.terrain);
        updateListContent(islandClimate, island.climate);
        updateListContent(islandHumanActivity, island.humanActivity);

        if (basicInfoSection) {
            basicInfoSection.classList.remove("content-switching");
        }

        if (islandInfoSection) {
            islandInfoSection.classList.remove("content-switching");
        }
    }, 200);
}

// --------------------------
// NÚT CHỌN ĐẢO
// --------------------------
islandButtons.forEach(button => {
    button.addEventListener("click", () => {
        islandButtons.forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        currentIsland = button.dataset.island;
        currentImageIndex = 0;

        updateIslandContent(currentIsland);
    });
});

// --------------------------
// NÚT CHỌN ẢNH NHỎ
// --------------------------
thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener("click", () => {
        currentImageIndex = index;

        if (galleryMainImage && thumbnail.dataset.image) {
            galleryMainImage.src = thumbnail.dataset.image;
        }

        thumbnails.forEach(thumb => thumb.classList.remove("active"));
        thumbnail.classList.add("active");
    });
});

// --------------------------
// NÚT XEM ẢNH TRƯỚC
// --------------------------
const galleryPrevButton = document.querySelector(".gallery-prev");

if (galleryPrevButton) {
    galleryPrevButton.addEventListener("click", () => {
        const images = islands[currentIsland].images;

        currentImageIndex =
            (currentImageIndex - 1 + images.length) % images.length;

        if (galleryMainImage) {
            galleryMainImage.src = images[currentImageIndex];
        }

        thumbnails.forEach(thumb => thumb.classList.remove("active"));

        if (thumbnails[currentImageIndex]) {
            thumbnails[currentImageIndex].classList.add("active");
        }
    });
}

// --------------------------
// NÚT XEM ẢNH TIẾP THEO
// --------------------------
const galleryNextButton = document.querySelector(".gallery-next");

if (galleryNextButton) {
    galleryNextButton.addEventListener("click", () => {
        const images = islands[currentIsland].images;

        currentImageIndex =
            (currentImageIndex + 1) % images.length;

        if (galleryMainImage) {
            galleryMainImage.src = images[currentImageIndex];
        }

        thumbnails.forEach(thumb => thumb.classList.remove("active"));

        if (thumbnails[currentImageIndex]) {
            thumbnails[currentImageIndex].classList.add("active");
        }
    });
}

// --------------------------
// VUỐT QUA LẠI ẢNH TRÊN ĐIỆN THOẠI
// --------------------------
if (gallery) {
    gallery.addEventListener("touchstart", event => {
        if (!event.changedTouches.length) return;

        touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    gallery.addEventListener("touchend", event => {
        if (!event.changedTouches.length) return;

        touchEndX = event.changedTouches[0].clientX;

        handleSwipe();
    }, { passive: true });
}

function handleSwipe() {
    const swipeThreshold = 50;
    const difference = touchStartX - touchEndX;
    const images = islands[currentIsland].images;

    if (Math.abs(difference) <= swipeThreshold) return;

    if (difference > 0) {
        // Vuốt sang trái: ảnh tiếp theo
        currentImageIndex =
            (currentImageIndex + 1) % images.length;
    } else {
        // Vuốt sang phải: ảnh trước đó
        currentImageIndex =
            (currentImageIndex - 1 + images.length) % images.length;
    }

    if (galleryMainImage) {
        galleryMainImage.src = images[currentImageIndex];
    }

    thumbnails.forEach(thumb => thumb.classList.remove("active"));

    if (thumbnails[currentImageIndex]) {
        thumbnails[currentImageIndex].classList.add("active");
    }
}

// --------------------------
// KHỞI TẠO TRANG
// --------------------------
function initializePage() {
    updateCelestialBody();
    updateIslandContent(currentIsland);

    // Cập nhật chế độ ngày/đêm mỗi phút
    setInterval(updateCelestialBody, 60000);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePage);
} else {
    initializePage();
}
