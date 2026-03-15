import {
  Badge,
  Box,
  Button,
  Card,
  Code,
  ColorSwatch,
  Divider,
  Group,
  JsonInput,
  Loader,
  Progress,
  ScrollArea,
  Select,
  SimpleGrid,
  Slider,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { useState } from 'react';

// ===== セクションラッパー =====
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useMantineTheme();
  return (
    <Card radius="md" p="lg" bg={theme.colors.dark[7]}>
      <Title order={4} mb="md" c="dimmed">
        {title}
      </Title>
      {children}
    </Card>
  );
}

// ===== カラーパレット =====
function ColorPalette() {
  const theme = useMantineTheme();
  const colorKeys = [
    'blue',
    'teal',
    'green',
    'yellow',
    'orange',
    'red',
    'violet',
    'grape',
  ] as const;
  return (
    <Section title="カラーパレット">
      <SimpleGrid cols={8}>
        {colorKeys.map((color) =>
          [5, 6, 7].map((shade) => (
            <Tooltip key={`${color}-${shade}`} label={`${color}.${shade}`} position="top">
              <ColorSwatch color={theme.colors[color][shade]} size={28} />
            </Tooltip>
          )),
        )}
      </SimpleGrid>
    </Section>
  );
}

// ===== ボタンバリエーション =====
function ButtonVariants() {
  const [loading, setLoading] = useState(false);

  function handleClick() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  }

  return (
    <Section title="ボタン">
      <Stack gap="sm">
        <Group>
          {(['filled', 'light', 'outline', 'subtle', 'default'] as const).map((v) => (
            <Button key={v} variant={v} size="sm">
              {v}
            </Button>
          ))}
        </Group>
        <Group>
          {(['blue', 'teal', 'red', 'orange', 'violet'] as const).map((c) => (
            <Button key={c} color={c} size="sm">
              {c}
            </Button>
          ))}
        </Group>
        <Group>
          <Button loading={loading} onClick={handleClick} size="sm">
            クリックでローディング
          </Button>
          <Button disabled size="sm">
            disabled
          </Button>
        </Group>
      </Stack>
    </Section>
  );
}

// ===== バッジ =====
function Badges() {
  return (
    <Section title="バッジ">
      <Group>
        {(['filled', 'light', 'outline', 'dot'] as const).map((v) => (
          <Badge key={v} variant={v}>
            {v}
          </Badge>
        ))}
        {(['blue', 'teal', 'red', 'orange', 'violet'] as const).map((c) => (
          <Badge key={c} color={c}>
            {c}
          </Badge>
        ))}
      </Group>
    </Section>
  );
}

// ===== フォームコントロール =====
function FormControls() {
  const [value, setValue] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [sliderVal, setSliderVal] = useState(40);
  const [checked, setChecked] = useState(false);

  return (
    <Section title="フォームコントロール">
      <SimpleGrid cols={2} spacing="md">
        <TextInput
          label="テキスト入力"
          placeholder="何か入力..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Select
          label="セレクト"
          placeholder="選択してください"
          value={selected}
          onChange={setSelected}
          data={['Option A', 'Option B', 'Option C', 'Option D']}
        />
        <Box>
          <Text size="sm" fw={500} mb={4}>
            スライダー: {sliderVal}
          </Text>
          <Slider value={sliderVal} onChange={setSliderVal} min={0} max={100} />
        </Box>
        <Box>
          <Text size="sm" fw={500} mb={8}>
            スイッチ
          </Text>
          <Switch
            checked={checked}
            onChange={(e) => setChecked(e.currentTarget.checked)}
            label={checked ? 'ON' : 'OFF'}
          />
        </Box>
        <Textarea label="テキストエリア" placeholder="複数行テキスト..." minRows={3} autosize />
        <JsonInput label="JSON 入力" placeholder='{"key": "value"}' formatOnBlur minRows={3} />
      </SimpleGrid>
    </Section>
  );
}

// ===== ローダー・プログレス =====
function LoadersAndProgress() {
  const [progress, setProgress] = useState(60);

  return (
    <Section title="ローダー / プログレス">
      <Stack gap="md">
        <Group>
          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
            <Loader key={s} size={s} />
          ))}
          {(['oval', 'bars', 'dots'] as const).map((t) => (
            <Loader key={t} type={t} />
          ))}
        </Group>
        <Box>
          <Text size="sm" fw={500} mb={4}>
            プログレスバー: {progress}%
          </Text>
          <Progress value={progress} mb="xs" />
          <Progress value={progress} color="teal" animated mb="xs" />
          <Group>
            <Button size="xs" onClick={() => setProgress((p) => Math.max(0, p - 10))}>
              -10
            </Button>
            <Button size="xs" onClick={() => setProgress((p) => Math.min(100, p + 10))}>
              +10
            </Button>
          </Group>
        </Box>
      </Stack>
    </Section>
  );
}

// ===== コード表示 =====
function CodeDisplay() {
  return (
    <Section title="コード表示">
      <Stack gap="sm">
        <Text size="sm">
          インラインコード: <Code>const x = 42;</Code> / <Code color="teal">npm install</Code>
        </Text>
        <Code block>{`// サンプルコード
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const result = greet('World');
console.log(result); // Hello, World!`}</Code>
      </Stack>
    </Section>
  );
}

// ===== メインページ =====
export default function PlaygroundPage() {
  return (
    <ScrollArea h="100%" flex={1}>
      <Box p="xl" maw={900} mx="auto">
        <Stack gap="xl">
          <Box>
            <Title order={2}>Playground</Title>
            <Text c="dimmed" size="sm" mt={4}>
              UIコンポーネントの動作確認・機能検証用サンドボックスページです。
            </Text>
            <Divider mt="sm" />
          </Box>

          <ColorPalette />
          <ButtonVariants />
          <Badges />
          <FormControls />
          <LoadersAndProgress />
          <CodeDisplay />
        </Stack>
      </Box>
    </ScrollArea>
  );
}
