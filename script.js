const content = window.INVITATION_CONTENT;

const gate = document.querySelector("#gate");
const main = document.querySelector("#main-content");
const openButton = document.querySelector("#open-invitation");
const yesButton = document.querySelector("#yes-button");
const rsvpNote = document.querySelector("#rsvp-note");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

openButton.addEventListener("click", () => {
  gate.classList.add("is-leaving");
  document.body.classList.remove("locked");
  main.setAttribute("aria-hidden", "false");
  window.scrollTo({ top: 0, behavior: "auto" });

  if (!reduceMotion) {
    launchConfetti(170);
  }

  window.setTimeout(() => {
    gate.hidden = true;
  }, 750);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 },
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

function updateCountdown() {
  const target = new Date(content.eventStart).getTime();
  const difference = Math.max(0, target - Date.now());
  const totalMinutes = Math.floor(difference / 60000);

  document.querySelector("#days").textContent = Math.floor(totalMinutes / 1440);
  document.querySelector("#hours").textContent = Math.floor((totalMinutes % 1440) / 60)
    .toString()
    .padStart(2, "0");
  document.querySelector("#minutes").textContent = (totalMinutes % 60)
    .toString()
    .padStart(2, "0");
}

updateCountdown();
window.setInterval(updateCountdown, 60000);

yesButton.addEventListener("click", async () => {
  if (!reduceMotion) {
    launchConfetti(240);
  }

  yesButton.textContent = "Ответ принят ❤️";
  yesButton.disabled = true;

  if (content.replyUrl) {
    window.location.href = content.replyUrl;
    return;
  }

  try {
    await navigator.clipboard.writeText(content.replyText);
    rsvpNote.textContent = "«Буду ❤️» скопировано — осталось отправить имениннику.";
  } catch {
    rsvpNote.textContent = "Решение принято. Теперь просто напиши имениннику: «Буду ❤️».";
  }

  rsvpNote.classList.add("is-success");
});

function launchConfetti(pieceCount) {
  const canvas = document.querySelector("#confetti");
  const context = canvas.getContext("2d");
  const colors = ["#f6eddf", "#e7a98f", "#c97978", "#8e2d42", "#f3cf75"];
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = window.innerWidth * pixelRatio;
  canvas.height = window.innerHeight * pixelRatio;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const pieces = Array.from({ length: pieceCount }, () => ({
    x: window.innerWidth / 2 + (Math.random() - 0.5) * 180,
    y: window.innerHeight * 0.42,
    size: 5 + Math.random() * 7,
    color: colors[Math.floor(Math.random() * colors.length)],
    velocityX: (Math.random() - 0.5) * 15,
    velocityY: -8 - Math.random() * 10,
    gravity: 0.22 + Math.random() * 0.13,
    rotation: Math.random() * Math.PI,
    rotationSpeed: (Math.random() - 0.5) * 0.3,
    opacity: 1,
  }));

  const startedAt = performance.now();

  function frame(now) {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    pieces.forEach((piece) => {
      piece.x += piece.velocityX;
      piece.velocityY += piece.gravity;
      piece.y += piece.velocityY;
      piece.rotation += piece.rotationSpeed;
      piece.opacity = Math.max(0, 1 - (now - startedAt) / 2600);

      context.save();
      context.globalAlpha = piece.opacity;
      context.translate(piece.x, piece.y);
      context.rotate(piece.rotation);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.6);
      context.restore();
    });

    if (now - startedAt < 2700) {
      requestAnimationFrame(frame);
    } else {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  requestAnimationFrame(frame);
}
