import logoSrc from '../../../../assets/branding/saytu-logo.png'

export function BrandLogo({ size = 'md', light = false, showText = true }) {
  const classes = ['brand-logo']

  if (size) {
    classes.push(`brand-logo-${size}`)
  }

  if (light) {
    classes.push('brand-logo-light')
  }

  return (
    <div className={classes.join(' ')}>
      <img src={logoSrc} alt="Saytu Edu" className="brand-logo-image" />
      {showText ? <span>Saytu Edu</span> : null}
    </div>
  )
}
