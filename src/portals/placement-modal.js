// Client portal placement dialog, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createPlacementModal(ctx) {
  const {
    CP_LABEL_PRESETS, CP_PALETTE, CP_STATUS_META, cpProjectUnit, h,
  } = ctx;

  function renderClientPortalPlacementModal(placement) {
    if (placement.type === 'measure') {
      return `
        <div class="cp-modal-backdrop" data-action="cp-placement-cancel">
          <form class="cp-modal" data-cp-scale-form>
            <div class="cp-modal-head"><span class="cp-modal-ico measure"><i class="ti ti-ruler-measure"></i></span><h3>Calibrate ruler scale</h3></div>
            <div class="cp-modal-body">
              <p class="cp-modal-text">This is the first measurement on this drawing. Enter the <strong>real-world length</strong> of the line you just drew — it sets the default scale for all future measurements on this plan.</p>
              <label class="cp-modal-label">Actual length of this line</label>
              <div class="cp-scale-input">
                <input name="cp_length" placeholder="e.g. 24 &middot; 24'6&quot; &middot; 18.5" autocomplete="off" autofocus />
                <select name="cp_unit" aria-label="Measurement unit">
                  ${[['ft', 'Feet (ft)'], ['in', 'Inches (in)'], ['cm', 'Centimeters (cm)']].map(([value, label]) => `<option value="${value}" ${cpProjectUnit() === value ? 'selected' : ''}>${label}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="cp-modal-foot">
              <button class="btn" type="button" data-action="cp-placement-cancel">Cancel</button>
              <button class="btn btn-primary" type="submit"><i class="ti ti-check"></i>Set scale</button>
            </div>
          </form>
        </div>`;
    }
    if (placement.type === 'comment') {
      return `
        <div class="cp-modal-backdrop" data-action="cp-placement-cancel">
          <form class="cp-modal" data-cp-comment-form>
            <div class="cp-modal-head"><span class="cp-modal-ico comment"><i class="ti ti-pin"></i></span><h3>New comment</h3></div>
            <div class="cp-modal-body">
              <label class="cp-modal-label">Comment on this point</label>
              <textarea name="text" rows="3" placeholder="e.g. Please confirm the window dimensions here…" autofocus></textarea>
            </div>
            <div class="cp-modal-foot">
              <button class="btn" type="button" data-action="cp-placement-cancel">Cancel</button>
              <button class="btn btn-primary" type="submit"><i class="ti ti-plus"></i>Add comment</button>
            </div>
          </form>
        </div>`;
    }
    if (placement.type === 'label') {
      return `
        <div class="cp-modal-backdrop" data-action="cp-placement-cancel">
          <form class="cp-modal" data-cp-label-form>
            <div class="cp-modal-head"><span class="cp-modal-ico label"><i class="ti ti-tag"></i></span><h3>Add label / note</h3></div>
            <div class="cp-modal-body">
              <label class="cp-modal-label">Label text</label>
              <input name="text" list="cp-label-presets" placeholder="e.g. Kitchen Revision" autocomplete="off" autofocus />
              <datalist id="cp-label-presets">${CP_LABEL_PRESETS.map((preset) => `<option value="${h(preset)}"></option>`).join('')}</datalist>
              <div class="cp-modal-sub">Quick picks</div>
              <div class="cp-preset-row">
                ${CP_LABEL_PRESETS.map((preset) => `<button class="cp-preset" type="button" data-action="cp-label-preset" data-text="${h(preset)}">${h(preset)}</button>`).join('')}
              </div>
              <div class="cp-modal-sub">Color</div>
              <div class="cp-preset-colors">
                ${CP_PALETTE.map((color) => `<button class="cp-cdot ${placement.color === color ? 'active' : ''}" type="button" data-action="cp-placement-color" data-color="${h(color)}" style="background:${h(color)}"></button>`).join('')}
              </div>
            </div>
            <div class="cp-modal-foot">
              <button class="btn" type="button" data-action="cp-placement-cancel">Cancel</button>
              <button class="btn btn-primary" type="submit"><i class="ti ti-plus"></i>Place label</button>
            </div>
          </form>
        </div>`;
    }
    // marker / status stamp
    return `
      <div class="cp-modal-backdrop" data-action="cp-placement-cancel">
        <div class="cp-modal">
          <div class="cp-modal-head"><span class="cp-modal-ico marker"><i class="ti ti-rosette-discount-check"></i></span><h3>Place status stamp</h3></div>
          <div class="cp-modal-body">
            <div class="cp-modal-label">Mark this section as</div>
            <div class="cp-stamp-grid">
              ${Object.entries(CP_STATUS_META).map(([key, meta]) => `
                <button class="cp-stamp-opt ${h(key)}" type="button" data-action="cp-place-marker" data-status="${h(key)}"><i class="ti ${meta.icon}"></i>${h(meta.label)}</button>
              `).join('')}
            </div>
            <form class="cp-stamp-custom" data-cp-marker-custom-form>
              <input name="text" placeholder="…or type a custom mark" autocomplete="off" />
              <button class="btn" type="submit"><i class="ti ti-plus"></i>Custom</button>
            </form>
          </div>
          <div class="cp-modal-foot">
            <button class="btn" type="button" data-action="cp-placement-cancel">Cancel</button>
          </div>
        </div>
      </div>`;
  }

  return { renderClientPortalPlacementModal };
}
