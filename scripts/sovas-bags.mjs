/**
 * Sova's Bags - Foundry VTT Module (v14.370 / dnd5e 6.1.0+)
 * Includes Hocus Pocus v2.0 Wild Magic automation, Sequencer/JB2A/PSFX/TokenMagic FX, and custom chat cards.
 */

const MODULE_ID = "sovas-bags";

const CATEGORY_META = {
  chaos: {
    badge: "Chaos & Kiff-Kiff",
    icon: "fa-solid fa-wand-magic-sparkles",
    colorHex: 0xc084fc,
    jb2aIntro: "modules/jb2a_patreon/Library/Generic/Particles/ParticleBurstRune01_01_Regular_BluePurple_600x600.webm",
    jb2aMain: "modules/jb2a_patreon/Library/Generic/Fireworks/Firework01_01_Regular_GreenOrange_600x600.webm",
    jb2aExtra: "modules/jb2a_patreon/Library/Generic/Butterflies/Butterflies_01_Bright_Blue_Many_400x400.webm",
    sfx: "modules/psfx-patreon/library/1st-level-spells/detect-magic/v1/detect-magic-001.ogg",
    shake: false
  },
  positive: {
    badge: "Pure Positif",
    icon: "fa-solid fa-sun",
    colorHex: 0x4ade80,
    jb2aIntro: "modules/jb2a_patreon/Library/Generic/Cast/CastShapeCircle01_01_Regular_Blue_600x600.webm",
    jb2aMain: "modules/jb2a_patreon/Library/Generic/On_Token/Buff/Ontoken_Buff001_001_GreenYellow_400x400.webm",
    jb2aExtra: "modules/jb2a_patreon/Library/Generic/Particles/ParticleBurstCircle01_01_Regular_Yellow_600x600.webm",
    sfx: "modules/psfx-patreon/library/1st-level-spells/bless/v1/bless-v1-001.ogg",
    shake: false
  },
  negative: {
    badge: "Poisse Cosmique",
    icon: "fa-solid fa-skull-crossbones",
    colorHex: 0xf87171,
    jb2aIntro: "modules/jb2a_patreon/Library/Generic/Cast/CastDark01_01_Regular_Red_600x600.webm",
    jb2aMain: "modules/jb2a_patreon/Library/Generic/Explosion/Explosion_01_Orange_400x400.webm",
    jb2aExtra: null,
    sfx: "modules/psfx-patreon/library/3rd-level-spells/fireball/v1/fireball-beam-01.ogg",
    shake: true
  },
  overdrive: {
    badge: "Folie Arcanique",
    icon: "fa-solid fa-meteor",
    colorHex: 0x38bdf8,
    jb2aIntro: "modules/jb2a_patreon/Library/Generic/Portals/Portal_Bright_Blue_H_400x400.webm",
    jb2aMain: "modules/jb2a_patreon/Library/Generic/Energy/EnergyAttack_01_01_Regular_MultiColor01_1000x1000.webm",
    jb2aExtra: "modules/jb2a_patreon/Library/Generic/Fireworks/Firework01_01_Regular_OrangeYellow_600x600.webm",
    sfx: "modules/psfx-patreon/library/3rd-level-spells/fireball/v1/fireball-beam-01.ogg",
    shake: true
  }
};

function inferCategory(table) {
  const flagCat = table?.flags?.[MODULE_ID]?.hocusPocus?.category;
  if (flagCat && CATEGORY_META[flagCat]) return flagCat;
  const n = (table?.name || "").toLowerCase();
  if (n.includes("posit") || n.includes("bénédiction") || n.includes("boon")) return "positive";
  if (n.includes("négat") || n.includes("negat") || n.includes("poisse") || n.includes("curse")) return "negative";
  if (n.includes("folie") || n.includes("overdrive") || n.includes("apocal")) return "overdrive";
  return "chaos";
}

async function getHocusPocusTables() {
  const byName = new Map();

  // 1. Compendium tables from Sova's Bags
  const pack = game.packs?.get(`${MODULE_ID}.sovas-bags-tables`);
  if (pack) {
    const docs = await pack.getDocuments();
    for (const doc of docs) {
      byName.set(doc.name, doc);
    }
  }

  // 2. World tables starting with "Hocus Pocus" override or extend the pool (dynamic 1dX!)
  for (const tbl of game.tables ?? []) {
    if (/^hocus\s*pocus/i.test(tbl.name || "")) {
      byName.set(tbl.name, tbl);
    }
  }

  return Array.from(byName.values()).sort((a, b) => {
    const oa = a.flags?.[MODULE_ID]?.hocusPocus?.order ?? a.sort ?? 999999;
    const ob = b.flags?.[MODULE_ID]?.hocusPocus?.order ?? b.sort ?? 999999;
    if (oa !== ob) return oa - ob;
    return (a.name || "").localeCompare(b.name || "");
  });
}

async function playHocusAnimations(token, category) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.chaos;
  const center = token ? (token.getCenterPoint?.() || token.center || { x: token.x, y: token.y }) : null;

  // Native ping fallback/accent
  if (center && typeof canvas?.ping === "function") {
    canvas.ping(center, { color: meta.colorHex, size: 110, duration: 1400 });
  }

  // Sequencer + JB2A + PSFX
  if (token && typeof Sequence !== "undefined") {
    try {
      const checkSrc = async (p) => {
        if (!p) return false;
        const fn = foundry?.utils?.srcExists ?? globalThis.srcExists;
        return typeof fn === "function" ? fn(p) : true;
      };

      const seq = new Sequence();
      let hasSteps = false;

      if (await checkSrc(meta.jb2aIntro)) {
        seq.effect()
          .file(meta.jb2aIntro)
          .atLocation(token)
          .scaleToObject(2.2)
          .belowTokens()
          .fadeIn(120)
          .fadeOut(250);
        hasSteps = true;
      }

      if (await checkSrc(meta.sfx)) {
        seq.sound().file(meta.sfx).volume(0.65);
        hasSteps = true;
      }

      if (await checkSrc(meta.jb2aMain)) {
        seq.wait(350)
          .effect()
          .file(meta.jb2aMain)
          .atLocation(token)
          .scaleToObject(2.4)
          .fadeIn(100)
          .fadeOut(350);
        hasSteps = true;
      }

      if (await checkSrc(meta.jb2aExtra)) {
        seq.effect()
          .file(meta.jb2aExtra)
          .atLocation(token)
          .scaleToObject(2.1)
          .fadeIn(150)
          .fadeOut(350);
      }

      if (meta.shake) {
        seq.canvasPan().shake({ duration: 450, strength: 12, rotation: true, fadeOutDuration: 250 });
      }

      if (hasSteps) await seq.play();
    } catch (err) {
      console.warn("Sova's Bags | Sequencer animation skipped:", err);
    }
  }

  // TokenMagic temporary aura flash
  if (token && typeof TokenMagic !== "undefined" && typeof TokenMagic.addUpdateFilters === "function") {
    const filterId = "sovasBagsHocusPocusGlow";
    try {
      await TokenMagic.addUpdateFilters(token, [{
        filterType: "glow",
        filterId,
        outerStrength: 4.5,
        innerStrength: 1.2,
        color: meta.colorHex,
        quality: 0.5,
        padding: 12,
        animated: {
          outerStrength: { active: true, loopDuration: 900, animType: "cosOscillation", val1: 2, val2: 5.5 }
        }
      }]);
      setTimeout(() => {
        TokenMagic.deleteFilters(token, filterId)?.catch?.(() => {});
      }, 2800);
    } catch (err) {
      console.warn("Sova's Bags | TokenMagic glow skipped:", err);
    }
  }
}

async function triggerHocusPocus({ actor = null, token = null } = {}) {
  const tables = await getHocusPocusTables();
  if (!tables.length) {
    ui.notifications?.warn("Sova's Bags | Aucune table Hocus Pocus trouvée.");
    return null;
  }

  const resolvedToken =
    token ||
    actor?.getActiveTokens?.(true, true)?.[0] ||
    canvas.tokens?.controlled?.[0] ||
    null;
  const resolvedActor = actor || resolvedToken?.actor || game.user?.character || null;

  // Step 1: Roll 1dX to pick a Wild Magic table
  const x = tables.length;
  const tableRoll = await new Roll(`1d${x}`).evaluate();
  const chosenTable = tables[Math.clamp(tableRoll.total - 1, 0, x - 1)];

  // Step 2: Roll 1d100 on the chosen table without duplicate default chat message
  const d100Roll = await new Roll(chosenTable.formula || "1d100").evaluate();
  const draw = await chosenTable.draw({ roll: d100Roll, displayChat: false });
  const resultDoc = draw?.results?.[0];

  const category = inferCategory(chosenTable);
  const meta = CATEGORY_META[category] ?? CATEGORY_META.chaos;

  // Fire canvas animations asynchronously so chat card appears snappily alongside FX
  playHocusAnimations(resolvedToken, category);

  const rawTitle = resultDoc?.name ? `<strong>${foundry.utils.escapeHTML(resultDoc.name)}</strong><br>` : "";
  const rawDesc = resultDoc?.description || "La magie sauvage crépite sans effet apparent.";
  const enrichFn = foundry?.applications?.ux?.TextEditor?.implementation?.enrichHTML ?? globalThis.TextEditor?.enrichHTML;
  const enrichedEffect = enrichFn
    ? await enrichFn(`${rawTitle}${rawDesc}`, { async: true, relativeTo: resolvedActor ?? undefined })
    : `${rawTitle}${rawDesc}`;

  const actorAttr = resolvedActor?.uuid ? `data-actor-uuid="${foundry.utils.escapeHTML(resolvedActor.uuid)}"` : "";
  const tokenAttr = resolvedToken?.document?.uuid ? `data-token-uuid="${foundry.utils.escapeHTML(resolvedToken.document.uuid)}"` : "";

  const content = `
    <div class="sovahp-card cat-${category}">
      <div class="sovahp-header">
        <span class="sovahp-title"><i class="${meta.icon}"></i> Hocus Pocus</span>
        <span class="sovahp-badge">${foundry.utils.escapeHTML(meta.badge)}</span>
      </div>
      <div class="sovahp-dice-row">
        <div class="sovahp-die-pill">
          <span class="die-label">Table (1d${x})</span>
          <span class="die-val">${tableRoll.total}</span>
        </div>
        <div class="sovahp-die-pill">
          <span class="die-label">Effet (1d100)</span>
          <span class="die-val">${d100Roll.total}</span>
        </div>
      </div>
      <div class="sovahp-table-name">${foundry.utils.escapeHTML(chosenTable.name)}</div>
      <div class="sovahp-effect-box">${enrichedEffect}</div>
      <div class="sovahp-actions">
        <button type="button" class="sovahp-reroll-btn" ${actorAttr} ${tokenAttr}>
          <i class="fa-solid fa-dice"></i> Relancer Hocus Pocus
        </button>
      </div>
    </div>
  `;

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: resolvedActor, token: resolvedToken?.document ?? resolvedToken }),
    rolls: [tableRoll, d100Roll],
    content
  });

  return { tableRoll, d100Roll, chosenTable, resultDoc };
}

function attachHocusChatListeners(rootEl) {
  if (!rootEl) return;
  const buttons = rootEl.querySelectorAll(".sovahp-reroll-btn");
  for (const btn of buttons) {
    if (btn.dataset.sovahpBound) continue;
    btn.dataset.sovahpBound = "1";
    btn.addEventListener("click", async () => {
      const actorUuid = btn.dataset.actorUuid;
      const tokenUuid = btn.dataset.tokenUuid;
      const actor = actorUuid ? await fromUuid(actorUuid).catch(() => null) : null;
      const tokenDoc = tokenUuid ? await fromUuid(tokenUuid).catch(() => null) : null;
      const token = tokenDoc?.object ?? null;
      if (actor && !actor.isOwner && !game.user?.isGM) {
        ui.notifications?.warn("Seul le propriétaire du personnage ou le MJ peut relancer ce jet.");
        return;
      }
      await triggerHocusPocus({ actor, token });
    });
  }
}

Hooks.once("init", () => {
  console.log("Sova's Bags | Initializing Sova's Bags module for D&D 5e 2024 (v6.1.0+)...");
  const chatHook = (game?.release?.generation >= 13) ? "renderChatMessageHTML" : "renderChatMessage";
  Hooks.on(chatHook, (_message, html) => {
    const el = html instanceof HTMLElement ? html : html?.[0];
    attachHocusChatListeners(el);
  });
});

Hooks.once("ready", () => {
  console.log("Sova's Bags | Ready! Subclasses, Species, and Hocus Pocus v2.0 loaded.");
  const mod = game.modules.get(MODULE_ID);
  if (mod) {
    mod.api = {
      triggerHocusPocus,
      getHocusPocusTables
    };
  }
});

// Trigger Hocus Pocus v2.0 automatically whenever the Hocus Pocus feat activity is used
Hooks.on("dnd5e.postUseActivity", (activity) => {
  const item = activity?.item;
  if (!item) return;
  const isHocus =
    item.system?.identifier === "hocus-pocus" ||
    item.name?.trim().toLowerCase() === "hocus pocus";
  if (!isHocus) return;

  triggerHocusPocus({ actor: activity.actor });
});
