import { Fragment } from 'inferno';
import { useBackend, useLocalState } from '../backend';
import { Box, Button, Input, Tabs, ProgressBar, Section, Flex, Icon, NoticeBox } from '../components';
import { Window } from '../layouts';
import { KEY_ENTER } from 'common/keycodes';

export const AiControlPanel = (props, context) => {
  const { act, data } = useBackend(context);

  const { username, has_access } = data;

  const [tab, setTab] = useLocalState(context, 'tab', 1);

  const [code, setCode] = useLocalState(context, 'code', null);

  if (!data.cleared_for_use) {
    return (
      <Window
        width={500}
        height={450}
        resizable>
        <Window.Content scrollable>
          <Section title="Authentication">
            <Box textAlign="center">
              <NoticeBox>Enter AI control code and press enter. (6 numbers)</NoticeBox>
              <Input value={code} placeholder="123456"
                onChange={(e, value) => {
                  if (e.keyCode === KEY_ENTER) {
                    setCode(null);
                    act('clear_for_use', { 'control_code': value });
                  } else {
                    setCode(value);
                  }
                }}
              />
            </Box>
          </Section>
        </Window.Content>
      </Window>
    );
  }

  return (
    <Window
      width={500}
      height={450}
      resizable>
      <Window.Content scrollable>
        {!!data.authenticated && (
          <Fragment>
            <Tabs>
              <Tabs.Tab
                selected={tab === 1}
                onClick={(() => setTab(1))}>
                Upload
              </Tabs.Tab>
              <Tabs.Tab
                selected={tab === 2}
                onClick={(() => setTab(2))}>
                Download
              </Tabs.Tab>
            </Tabs>
            {tab === 1 && (
              <Section title="Upload" buttons={(
                <Fragment>
                  <Button onClick={() => act("eject_intellicard")} color="bad" icon="eject" tooltip="Ejects IntelliCard, cancelling any current downloads" disabled={!data.intellicard}>Eject IntelliCard</Button>
                  <Button icon="sign-out-alt" color="bad" tooltip={!data.can_log_out ? "This console has administrator privileges and cannot be logged out of." : null} disabled={!data.can_log_out} onClick={() => act("log_out")}>Log Out</Button>
                </Fragment>
              )}>
                <NoticeBox>Upload also possible by inserting an MMI or Positronic Brain</NoticeBox>
                {!data.intellicard && (
                  <Flex align="center" justify="center">
                    <Flex.Item>
                      <NoticeBox>No IntelliCard inserted!</NoticeBox>
                    </Flex.Item>
                  </Flex>
                ) || (
                  <Box>
                    {data.intellicard_ai && (
                      <Flex align="center" justify="center">
                        <Flex.Item width="50%">
                          <Section textAlign="center" title={data.intellicard_ai}>
                            <ProgressBar ranges={{ good: [75, Infinity], average: [25, 75], bad: [-Infinity, 25] }} mb={0.75} minValue="0" maxValue="100" value={data.intellicard_ai_health} />
                            <Button color="good" icon="upload" disabled={!data.can_upload} tooltip={!data.can_upload ? "A common cause of upload being unavailable is a lack of any active AI data cores." : null}
                              onClick={() => act("upload_intellicard")}>Upload
                            </Button>
                          </Section>
                        </Flex.Item>
                      </Flex>
                    ) || (
                      <Flex align="center" justify="center">
                        <Flex.Item>
                          <NoticeBox>Intellicard contains no AI!</NoticeBox>
                        </Flex.Item>
                      </Flex>
                    )}
                  </Box>
                )}
              </Section>
            )}
            {tab === 2 && (
              <Section title="AIs Available for Download" buttons={(
                <Fragment>
                  <Button onClick={() => act("eject_intellicard")} color="bad" icon="eject" tooltip="Ejects IntelliCard, cancelling any current downloads" disabled={!data.intellicard}>Eject IntelliCard</Button>
                  <Button icon="sign-out-alt" color="bad" onClick={() => act("log_out")}>Log Out</Button>
                </Fragment>
              )}>
                {data.downloading && (
                  <Fragment>
                    <NoticeBox mb={0.1} danger>Currently downloading {data.downloading}</NoticeBox>
                    <ProgressBar color="bad" minValue="0" value={data.download_progress} maxValue="100" />
                    <Button mt={0.5} fluid color="bad" icon="stop" tooltip="WARNING" textAlign="center" onClick={() => act("stop_download")}>Cancel Download</Button>
                    {!!data.current_ai_ref && data.current_ai_ref === data.downloading_ref && (
                      <Button color="average" icon="download" onClick={() => act("skip_download")}>Instantly finish download</Button>
                    )}
                  </Fragment>

                )|| (
                  <Box>
                    {data.ais.filter(ai => {
                      return !!ai.in_core;
                    }).map((ai, index) => {
                      return (
                        <Section key={index} title={(<Box inline color={ai.active ? "good" : "bad"}>{ai.name} | {ai.active ? "Active" : "Inactive"}</Box>)}
                          buttons={(
                            <Fragment>
                              <Button color={ai.can_download ? "good" : "bad"} tooltip={!data.intellicard ? ai.can_download ? "Requires IntelliCard" : "&¤!65%" : null} disabled={data.intellicard ? !ai.can_download : true} icon="download" onClick={() => act("start_download", { download_target: ai.ref })}>{ai.can_download ? "Download" : "&gr4&!/"}</Button>
                              {!!data.is_infiltrator && !ai.being_hijacked && (
                                <Button color="good" tooltip="Requires serial exploitation unit" icon="download" onClick={() => act("start_hijack", { target_ai: ai.ref })}>Start hijacking</Button>
                              ) }
                              {!!ai.being_hijacked && (
                                <Button color="bad" icon="stop" onClick={() => act("stop_hijack", { target_ai: ai.ref })}>Stop hijacking</Button>
                              )}
                            </Fragment>
                          )}>
                          <Box bold>Integrity:</Box>
                          <ProgressBar mt={0.5} minValue={0}
                            ranges={{
                              good: [75, Infinity],
                              average: [25, 75],
                              bad: [-Infinity, 25],
                            }}
                            value={ai.health} maxValue={100} />
                        </Section>
                      );
                    })}
                  </Box>
                )}
              </Section>
            )}
          </Fragment>
        ) || (
          <Section title="Welcome">
            <Flex align="center" justify="center" mt="0.5rem" mb="0.5rem">
              <Flex.Item>
                <Fragment>
                  {data.user_image && (
                    <Fragment style={`position:relative`}>
                      <img src={data.user_image}
                        width="125px" height="125px"
                        style={`-ms-interpolation-mode: nearest-neighbor;
                        border-radius: 50%; border: 3px solid white;
                        margin-right:-125px`} />
                      <img src="scanlines.png"
                        width="125px" height="125px"
                        style={`-ms-interpolation-mode: nearest-neighbor;
                        border-radius: 50%; border: 3px solid white;opacity: 0.3;`} />
                    </Fragment>
                  ) || (
                    <Icon name="user-circle"
                      verticalAlign="middle" size="4.5" mr="1rem" />
                  )}
                  <Box inline fontSize="18px" bold>{username ? username : "Unknown"}</Box>
                  <NoticeBox success={has_access} danger={!has_access}
                    textAlign="center" mt="1.5rem">
                    {has_access ? "Access Granted" : "Access Denied"}
                  </NoticeBox>
                  <Box textAlign="center">
                    <Button icon="sign-in-alt" color={has_access ? "good" : "bad"} fluid
                      onClick={() => {
                        act("log_in");
                      }} >
                      Log In
                    </Button>
                  </Box>
                </Fragment>
              </Flex.Item>

            </Flex>
            <NoticeBox color="red">Alternatively you can use the AI Control Code as a one-time password. This will alert the station of your location and name.</NoticeBox>
            <Box textAlign="center">
              <Input placeholder="123456"
                onChange={(e, value) => {
                  if (e.keyCode === KEY_ENTER) {
                    act('log_in_control_code', { 'control_code': value });
                  }
                }} />
            </Box>
          </Section>
        )}
      </Window.Content>
    </Window>
  );
};
