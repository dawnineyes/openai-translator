import React, { useCallback, useEffect, useState } from 'react'
import _ from 'underscore'
import icon from './assets/images/icon.png'
import beams from './assets/images/beams.jpg'
import toast, { Toaster } from 'react-hot-toast'
import * as utils from '../common/utils'
import { Client as Styletron } from 'styletron-engine-atomic'
import { Provider as StyletronProvider } from 'styletron-react'
import { BaseProvider } from 'baseui-sd'
import { Input } from 'baseui-sd/input'
import { createForm } from '../components/Form'
import formStyles from 'inline:../components/Form/index.module.css'
import { Button } from 'baseui-sd/button'
import './index.css'
import { TranslateMode, Provider } from '../content_script/translate'
import { Select, Value, Option } from 'baseui-sd/select'
import { Checkbox } from 'baseui-sd/checkbox'
import { supportLanguages } from '../content_script/lang'
import { useRecordHotkeys } from 'react-hotkeys-hook'
import { createUseStyles } from 'react-jss'
import clsx from 'clsx'
import { IThemedStyleProps, ThemeType } from '../common/types'
import { useTheme } from '../common/hooks/useTheme'
import { useThemeType } from '../common/hooks/useThemeType'
import { IoCloseCircle } from 'react-icons/io5'
import { useTranslation } from 'react-i18next'

const langOptions: Value = supportLanguages.reduce((acc, [id, label]) => {
    return [
        ...acc,
        {
            id,
            label,
        } as Option,
    ]
}, [] as Value)

interface ILanguageSelectorProps {
    value?: string
    onChange?: (value: string) => void
    onBlur?: () => void
}

function LanguageSelector(props: ILanguageSelectorProps) {
    const { value, onChange, onBlur } = props

    return (
        <Select
            onBlur={onBlur}
            size='compact'
            clearable={false}
            options={langOptions}
            value={value ? [{ id: value }] : []}
            onChange={({ value }) => {
                const selected = value[0]
                onChange?.(selected?.id as string)
            }}
        />
    )
}

interface ITranslateModeSelectorProps {
    value?: TranslateMode | 'nop'
    onChange?: (value: TranslateMode | 'nop') => void
    onBlur?: () => void
}

interface AutoTranslateCheckboxProps {
    value?: boolean
    onChange?: (value: boolean) => void
    onBlur?: () => void
}

interface IProviderSelectorProps {
    value?: Provider | 'OpenAI'
    onChange?: (value: Provider | 'OpenAI') => void
}

function TranslateModeSelector(props: ITranslateModeSelectorProps) {
    const { t } = useTranslation()

    return (
        <Select
            size='compact'
            onBlur={props.onBlur}
            searchable={false}
            clearable={false}
            value={
                props.value && [
                    {
                        id: props.value,
                    },
                ]
            }
            onChange={(params) => {
                props.onChange?.(params.value[0].id as TranslateMode | 'nop')
            }}
            options={
                [
                    { label: t('Translate'), id: 'translate' },
                    { label: t('Polishing'), id: 'polishing' },
                    { label: t('Summarize'), id: 'summarize' },
                    { label: t('Analyze'), id: 'analyze' },
                    { label: t('Explain Code'), id: 'explain-code' },
                    { label: t('Nop'), id: 'nop' },
                ] as {
                    label: string
                    id: TranslateMode
                }[]
            }
        />
    )
}

interface IThemeTypeSelectorProps {
    value?: TranslateMode | 'nop'
    onChange?: (value: TranslateMode | 'nop') => void
    onBlur?: () => void
}

function ThemeTypeSelector(props: IThemeTypeSelectorProps) {
    const { t } = useTranslation()

    return (
        <Select
            size='compact'
            onBlur={props.onBlur}
            searchable={false}
            clearable={false}
            value={
                props.value && [
                    {
                        id: props.value,
                    },
                ]
            }
            onChange={(params) => {
                props.onChange?.(params.value[0].id as TranslateMode | 'nop')
            }}
            options={
                [
                    { label: t('Follow the System'), id: 'followTheSystem' },
                    { label: t('Dark'), id: 'dark' },
                    { label: t('Light'), id: 'light' },
                ] as {
                    label: string
                    id: ThemeType
                }[]
            }
        />
    )
}

interface Ii18nSelectorProps {
    value?: string
    onChange?: (value: string) => void
    onBlur?: () => void
}

function Ii18nSelector(props: Ii18nSelectorProps) {
    const { i18n } = useTranslation()

    const options = [
        { label: 'English', id: 'en' },
        { label: '简体中文', id: 'zh-Hans' },
        { label: '繁體中文', id: 'zh-Hant' },
        { label: '日本語', id: 'ja' },
    ]

    return (
        <Select
            size='compact'
            onBlur={props.onBlur}
            searchable={false}
            clearable={false}
            value={
                props.value
                    ? [
                          {
                              id: props.value,
                              label: options.find((option) => option.id === props.value)?.label || 'en',
                          },
                      ]
                    : undefined
            }
            onChange={(params) => {
                props.onChange?.(params.value[0].id as string)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ;(i18n as any).changeLanguage(params.value[0].id as string)
            }}
            options={options}
        />
    )
}

interface AutoTranslateCheckboxProps {
    value?: boolean
    onChange?: (value: boolean) => void
    onBlur?: () => void
}

function AutoTranslateCheckbox(props: AutoTranslateCheckboxProps) {
    return (
        <Checkbox
            checkmarkType='toggle_round'
            checked={props.value}
            onChange={(e) => {
                props.onChange?.(e.target.checked)
                props.onBlur?.()
            }}
        />
    )
}

const useHotkeyRecorderStyles = createUseStyles({
    'hotkeyRecorder': (props: IThemedStyleProps) => ({
        position: 'relative',
        height: '32px',
        lineHeight: '32px',
        padding: '0 14px',
        borderRadius: '4px',
        width: '200px',
        cursor: 'pointer',
        border: '1px dashed transparent',
        backgroundColor: props.theme.colors.backgroundTertiary,
    }),
    'clearHotkey': {
        position: 'absolute',
        top: '10px',
        right: '12px',
    },
    'caption': {
        marginTop: '4px',
        fontSize: '11px',
        color: '#999',
    },
    'recording': {
        animation: '$recording 2s infinite',
    },
    '@keyframes recording': {
        '0%': {
            backgroundColor: 'transparent',
        },
        '50%': {
            backgroundColor: 'rgb(238, 238, 238)',
            borderColor: '#999',
        },
        '100%': {
            backgroundColor: 'transparent',
        },
    },
})

interface IHotkeyRecorderProps {
    value?: string
    onChange?: (value: string) => void
    onBlur?: () => void
}

function HotkeyRecorder(props: IHotkeyRecorderProps) {
    const { theme, themeType } = useTheme()

    const { t } = useTranslation()

    const styles = useHotkeyRecorderStyles({ themeType, theme })
    const [keys, { start, stop, isRecording }] = useRecordHotkeys()

    const [hotKeys, setHotKeys] = useState<string[]>([])
    useEffect(() => {
        if (props.value) {
            setHotKeys(
                props.value
                    .replace(/-/g, '+')
                    .split('+')
                    .map((k) => k.trim())
                    .filter(Boolean)
            )
        }
    }, [props.value])

    useEffect(() => {
        let keys_ = Array.from(keys)
        if (keys_ && keys_.length > 0) {
            keys_ = keys_.filter((k) => k.toLowerCase() !== 'meta')
            setHotKeys(keys_)
            props.onChange?.(keys_.join('+'))
        }
    }, [keys])

    useEffect(() => {
        if (!isRecording) {
            props.onChange?.(hotKeys.join('+'))
        }
    }, [isRecording])

    useEffect(() => {
        const stopRecording = () => {
            if (isRecording) {
                stop()
                props.onBlur?.()
            }
        }
        document.addEventListener('click', stopRecording)
        return () => {
            document.removeEventListener('click', stopRecording)
        }
    }, [isRecording, props.onBlur])

    function clearHotkey() {
        props.onChange?.('')
        setHotKeys([])
    }

    return (
        <div>
            <div
                onClick={(e) => {
                    e.stopPropagation()
                    e.currentTarget.focus()
                    if (!isRecording) {
                        start()
                    } else {
                        stop()
                    }
                }}
                className={clsx(styles.hotkeyRecorder, {
                    [styles.recording]: isRecording,
                })}
            >
                {hotKeys.join(' + ')}
                {!isRecording && hotKeys.length > 0 ? (
                    <IoCloseCircle
                        className={styles.clearHotkey}
                        onClick={(e) => {
                            e.stopPropagation()
                            clearHotkey()
                        }}
                    />
                ) : null}
            </div>
            <div className={styles.caption}>
                {isRecording ? t('Please press the hotkey you want to set.') : t('Click above to set hotkeys.')}
            </div>
        </div>
    )
}

function ProviderSelector(props: IProviderSelectorProps) {
    return (
        <Select
            size='compact'
            searchable={false}
            clearable={false}
            value={
                props.value && [
                    {
                        id: props.value,
                    },
                ]
            }
            onChange={(params) => {
                props.onChange?.(params.value[0].id as Provider | 'OpenAI')
            }}
            options={
                [
                    { label: 'OpenAI', id: 'OpenAI' },
                    { label: 'Azure', id: 'Azure' },
                ] as {
                    label: string
                    id: Provider
                }[]
            }
        />
    )
}

const engine = new Styletron()

const { Form, FormItem, useForm } = createForm<utils.ISettings>()

interface IPopupProps {
    onSave?: (oldSettings: utils.ISettings) => void
}

export function Settings(props: IPopupProps) {
    const { theme } = useTheme()
    const { setThemeType } = useThemeType()

    const { t } = useTranslation()

    const [loading, setLoading] = useState(false)
    const [values, setValues] = useState<utils.ISettings>({
        apiKeys: '',
        apiURL: utils.defaultAPIURL,
        apiURLPath: utils.defaultAPIURLPath,
        provider: utils.defaultProvider,
        autoTranslate: utils.defaultAutoTranslate,
        defaultTranslateMode: 'translate',
        defaultTargetLanguage: utils.defaultTargetLanguage,
        hotkey: '',
        i18n: utils.defaulti18n,
    })
    const [prevValues, setPrevValues] = useState<utils.ISettings>(values)

    const [form] = useForm()

    useEffect(() => {
        form.setFieldsValue(values)
    }, [form, values])

    useEffect(() => {
        !(async () => {
            const settings = await utils.getSettings()
            setValues(settings)
            setPrevValues(settings)
        })()
    }, [])

    const onChange = useCallback((_changes: Partial<utils.ISettings>, values_: utils.ISettings) => {
        setValues(values_)
    }, [])

    const onSubmmit = useCallback(async (data: utils.ISettings) => {
        setLoading(true)
        const oldSettings = await utils.getSettings()
        await utils.setSettings(data)
        toast(t('Saved'), {
            icon: '👍',
            duration: 3000,
        })
        setLoading(false)
        if (data.themeType) {
            setThemeType(data.themeType)
        }
        props.onSave?.(oldSettings)
    }, [])

    const onBlur = useCallback(async () => {
        if (values.apiKeys && !_.isEqual(values, prevValues)) {
            await utils.setSettings(values)
            setPrevValues(values)
        }
    }, [values])

    const { themeType } = useTheme()

    return (
        <div
            style={{
                background: themeType === 'dark' ? '#1f1f1f' : '#fff',
                minWidth: 400,
            }}
        >
            <style>{formStyles}</style>
            <StyletronProvider value={engine}>
                <BaseProvider theme={theme}>
                    <nav
                        style={{
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: '15px 25px',
                            color: '#333',
                            background: `url(${beams}) no-repeat center center`,
                            gap: 10,
                        }}
                        data-tauri-drag-region
                    >
                        <img width='22' src={icon} alt='logo' />
                        <h2>OpenAI Translator</h2>
                    </nav>
                    <Form
                        form={form}
                        style={{
                            padding: '20px 25px',
                        }}
                        onFinish={onSubmmit}
                        initialValues={values}
                        onValuesChange={onChange}
                    >
                        <FormItem name='provider' label={t('Default Service Provider')}>
                            <ProviderSelector />
                        </FormItem>
                        <FormItem
                            required
                            name='apiKeys'
                            label={t('API Key')}
                            caption={
                                <div>
                                    {t('Go to the')}{' '}
                                    <a
                                        target='_blank'
                                        href='https://platform.openai.com/account/api-keys'
                                        rel='noreferrer'
                                    >
                                        {t('OpenAI page')}
                                    </a>{' '}
                                    {t(
                                        'to get your API Key. You can separate multiple API Keys with English commas to achieve quota doubling and load balancing.'
                                    )}
                                </div>
                            }
                        >
                            <Input autoFocus type='password' size='compact' onBlur={onBlur} />
                        </FormItem>
                        <FormItem required name='apiURL' label={t('API URL')}>
                            <Input size='compact' onBlur={onBlur} />
                        </FormItem>
                        <FormItem required name='apiURLPath' label={t('API URL Path')}>
                            <Input size='compact' />
                        </FormItem>
                        <FormItem name='defaultTranslateMode' label={t('Default Translate Mode')}>
                            <TranslateModeSelector onBlur={onBlur} />
                        </FormItem>
                        <FormItem name='autoTranslate' label={t('Auto Translate')}>
                            <AutoTranslateCheckbox onBlur={onBlur} />
                        </FormItem>
                        <FormItem name='defaultTargetLanguage' label={t('Default Target Language')}>
                            <LanguageSelector onBlur={onBlur} />
                        </FormItem>
                        <FormItem name='themeType' label={t('Theme')}>
                            <ThemeTypeSelector onBlur={onBlur} />
                        </FormItem>
                        <FormItem name='i18n' label={t('i18n')}>
                            <Ii18nSelector onBlur={onBlur} />
                        </FormItem>
                        <FormItem name='hotkey' label={t('Hotkey')}>
                            <HotkeyRecorder onBlur={onBlur} />
                        </FormItem>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexDirection: 'row',
                                gap: 10,
                            }}
                        >
                            <div
                                style={{
                                    marginRight: 'auto',
                                }}
                            />
                            <Button isLoading={loading} size='compact'>
                                {t('Save')}
                            </Button>
                        </div>
                        <Toaster />
                    </Form>
                </BaseProvider>
            </StyletronProvider>
        </div>
    )
}
