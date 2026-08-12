export function renderStageManagerModal({ kind, stages, h, pipelineDot, renderModalShell }) {
  const title = kind === 'contacts' ? 'Contact pipeline stages' : kind === 'deals' ? 'Quote pipeline stages' : 'Job pipeline stages';
  const body = `
    <form class="stage-manager" data-stage-form data-kind="${kind}">
      <p class="stage-manager-hint">Stages are your pipeline columns - the placeholder groups your team can shape. Rename, recolor, or reorder any stage and your records keep their place; add new stages for any workflow.</p>
      <div class="stage-rows">
        ${stages.map((stage, i) => `
          <div class="stage-row">
            <span class="stage-row-handle">${pipelineDot(stage.color)}</span>
            <input type="text" name="name_${i}" value="${h(stage.name)}" placeholder="Stage name" />
            <input type="hidden" name="orig_${i}" value="${h(stage.name)}" />
            <input class="stage-color" type="color" name="color_${i}" value="${h(/^#[0-9a-fA-F]{6}$/.test(stage.color) ? stage.color : '#9aa0a8')}" aria-label="Stage color" />
            <span class="stage-reorder" aria-label="Reorder ${h(stage.name)}">
              <button class="btn" type="button" data-action="move-stage" data-delta="-1" aria-label="Move ${h(stage.name)} up" ${i === 0 ? 'disabled' : ''}><i class="ti ti-chevron-up"></i></button>
              <button class="btn" type="button" data-action="move-stage" data-delta="1" aria-label="Move ${h(stage.name)} down" ${i === stages.length - 1 ? 'disabled' : ''}><i class="ti ti-chevron-down"></i></button>
            </span>
            <button class="btn danger stage-del" type="button" data-action="delete-stage" data-module="${kind}" data-index="${i}" aria-label="Delete stage"><i class="ti ti-trash"></i></button>
          </div>
        `).join('')}
      </div>
      <button class="btn add-stage-btn" type="button" data-action="add-stage" data-module="${kind}"><i class="ti ti-plus"></i>Add stage</button>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save stages</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `;
  return renderModalShell('Pipeline', title, body, 'wide-modal');
}
