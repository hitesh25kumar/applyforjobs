const statusElement = document.querySelector<HTMLElement>('#status')!;
const messageElement = document.querySelector<HTMLElement>('#message')!;
const codeInput = document.querySelector<HTMLInputElement>('#pairing-code')!;
const apiInput = document.querySelector<HTMLInputElement>('#api-url')!;
const taskInput = document.querySelector<HTMLInputElement>('#task-id')!;
const pairButton = document.querySelector<HTMLButtonElement>('#pair')!;
const prepareButton = document.querySelector<HTMLButtonElement>('#prepare')!;
const fillButton = document.querySelector<HTMLButtonElement>('#fill')!;
const disconnectButton = document.querySelector<HTMLButtonElement>('#disconnect')!;

function showMessage(message: string, isError = false): void {
  messageElement.textContent = message;
  messageElement.dataset.kind = isError ? 'error' : 'info';
}

async function send(message: ExtensionMessage): Promise<ExtensionResponse> {
  return chrome.runtime.sendMessage(message);
}

async function refreshStatus(): Promise<void> {
  statusElement.textContent = 'Connecting…';
  statusElement.dataset.status = 'connecting';
  const result = await send({ type: 'status' });
  statusElement.textContent = result.status || 'error';
  statusElement.dataset.status = result.status || 'error';
  pairButton.hidden = result.status === 'connected';
  prepareButton.disabled = result.status !== 'connected';
  fillButton.disabled = result.status !== 'connected' || !taskInput.value;
  disconnectButton.hidden = result.status !== 'connected';
  if (result.message) showMessage(result.message, result.status === 'error');
}

pairButton.addEventListener('click', async () => {
  pairButton.disabled = true;
  statusElement.textContent = 'Connecting…';
  statusElement.dataset.status = 'connecting';
  try {
    const result = await send({
      type: 'pair',
      code: codeInput.value.trim(),
      apiBaseUrl: apiInput.value.trim(),
    });
    if (!result.ok) throw new Error(result.message || 'Could not connect.');
    showMessage('Extension paired to your account.');
  } catch (error) {
    showMessage(error instanceof Error ? error.message : 'Could not connect.', true);
  } finally {
    pairButton.disabled = false;
    await refreshStatus();
  }
});

prepareButton.addEventListener('click', async () => {
  prepareButton.disabled = true;
  try {
    const result = await send({ type: 'prepare-current-job' });
    if (!result.ok) throw new Error(result.message || 'Could not prepare this job.');
    taskInput.value = result.taskId || '';
    fillButton.disabled = !taskInput.value;
    showMessage(
      `Job: ${result.job?.title} at ${result.job?.company}. Click "Prepare form" when ready; submission stays manual.`,
    );
  } catch (error) {
    showMessage(error instanceof Error ? error.message : 'Could not prepare this job.', true);
  } finally {
    prepareButton.disabled = false;
  }
});

fillButton.addEventListener('click', async () => {
  fillButton.disabled = true;
  try {
    const result = await send({ type: 'fill-current-form', taskId: taskInput.value });
    if (!result.ok) throw new Error(result.message || 'Could not prepare the form.');
    showMessage(result.message || 'Form prepared. Review every field before submitting.');
  } catch (error) {
    showMessage(error instanceof Error ? error.message : 'Could not prepare the form.', true);
  } finally {
    fillButton.disabled = false;
  }
});

disconnectButton.addEventListener('click', async () => {
  await send({ type: 'disconnect' });
  taskInput.value = '';
  showMessage('Extension disconnected.');
  await refreshStatus();
});

void refreshStatus();
