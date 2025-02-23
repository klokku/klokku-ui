import darkLogoImage from '../../assets/logo/klokku-logo-dark-v2.svg'
import brightLogoImage from '../../assets/logo/klokku-logo-v2.svg'


type HeaderLogoProps = {
    className?: string;
    dark?: boolean;
};

export default function HeaderLogo({className, dark}: HeaderLogoProps) {
    return (
        <>
            <img src={dark ? darkLogoImage : brightLogoImage} alt="logo" className={className}/>
        </>
    )
}
